import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { PlaygroundApi, safeError, validateVideo, PlaygroundError, type GetSessionToken, type MediaStatus } from './playground-api';
import { formatMetadata, pollMedia, ThumbnailUrl } from './playground-flow';

type Phase = 'checking' | 'registering' | 'uploading' | 'processing' | 'complete' | 'error' | 'stopped';
const descriptions: Record<Phase, string> = {
  checking: 'Checking your linked Lumen project…',
  registering: 'Registering your video…',
  uploading: 'Uploading MP4 bytes. Processing has not completed yet…',
  processing: 'Upload received. Waiting for metadata and thumbnail processing…',
  complete: 'Metadata and thumbnail jobs completed.',
  error: 'The operation needs attention.',
  stopped: 'Stopped waiting in this browser. Any server-side work may continue.',
};

export function PlaygroundProcessing({ file, getToken }: { file: File; getToken: GetSessionToken }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [project, setProject] = useState('');
  const [media, setMedia] = useState<MediaStatus | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const tokenProvider = useRef(getToken);
  const controller = useRef<AbortController | null>(null);
  const asset = useRef<string | null>(null);
  const thumbnailUrl = useRef(new ThumbnailUrl());
  const apiBase = import.meta.env.VITE_LUMEN_API_BASE_URL as string | undefined;
  useEffect(() => { tokenProvider.current = getToken; }, [getToken]);

  async function finish(api: PlaygroundApi, id: string, signal: AbortSignal) {
    setPhase('processing');
    const status = await pollMedia(api, id, signal, setMedia);
    signal.throwIfAborted();
    if (status.thumbnail.status === 'ready' && status.thumbnail.url) {
      try {
        const blob = await api.thumbnail(id, status.thumbnail.url, signal);
        signal.throwIfAborted();
        setThumbnail(thumbnailUrl.current.replace(blob, signal));
      } catch (error) {
        signal.throwIfAborted();
        setWarning(`Thumbnail unavailable. ${safeError(error)}`);
      }
    } else setWarning('Processing completed, but no thumbnail output is available. Ask the operator to check storage.');
    signal.throwIfAborted();
    setPhase('complete');
  }

  useEffect(() => {
    const current = new AbortController();
    controller.current = current;
    asset.current = null;
    setError(''); setWarning(''); setMedia(null); setThumbnail(null); setProject(''); setPhase('checking');
    thumbnailUrl.current.clear();
    async function process() {
      let registering = false;
      try {
        const api = new PlaygroundApi(apiBase, options => tokenProvider.current(options));
        const linked = await api.project(current.signal);
        current.signal.throwIfAborted();
        setProject(linked.name);
        const problem = validateVideo(file);
        if (problem) throw new PlaygroundError(problem);
        setPhase('registering');
        registering = true;
        const registration = await api.register(file, current.signal);
        current.signal.throwIfAborted();
        asset.current = registration.id;
        setPhase('uploading');
        await api.upload(file, registration, current.signal);
        await finish(api, registration.id, current.signal);
      } catch (error) {
        if (!current.signal.aborted) {
          setError(safeError(error) + (registering && !asset.current
            ? ' Registration may have succeeded without a confirmed response. Ask the operator to check before registering again.' : ''));
          setPhase('error');
        }
      }
    }
    void process();
    return () => { current.abort(); controller.current?.abort(); thumbnailUrl.current.clear(); };
  }, [file, apiBase]);

  async function checkStatus() {
    if (!asset.current) return;
    controller.current?.abort();
    const current = new AbortController(); controller.current = current;
    thumbnailUrl.current.clear(); setThumbnail(null); setWarning(''); setError('');
    try {
      await finish(new PlaygroundApi(apiBase, options => tokenProvider.current(options)), asset.current, current.signal);
    } catch (error) {
      if (!current.signal.aborted) { setError(safeError(error)); setPhase('error'); }
    }
  }
  const busy = ['checking', 'registering', 'uploading', 'processing'].includes(phase);
  return <div className="playground-processing">
    <p role="status" aria-live="polite" aria-atomic="true">{descriptions[phase]}</p>
    {project && <p>Project: <strong>{project}</strong></p>}
    <p role="alert">{error}</p>
    {media && <div className="playground-results">
      <h3>Video results</h3>
      <p>Upload lifecycle: <strong>{media.status}</strong>. This is separate from job completion.</p>
      <ul aria-label="Processing jobs">{media.processing.map((job, index) =>
        <li key={`${job.operation}-${index}`}>{job.operation === 'extract_metadata' ? 'Metadata extraction' : job.operation === 'generate_thumbnail' ? 'Thumbnail generation' : 'Transcoding'}: <strong>{job.status}</strong></li>)}</ul>
      <dl className="playground-metadata">{formatMetadata(media).map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
      {thumbnail && <img className="playground-thumbnail" src={thumbnail} alt={`Generated thumbnail for ${media.original_filename}`}
        onError={() => {
          thumbnailUrl.current.clear(); setThumbnail(null);
          setWarning('Thumbnail unavailable: the returned image could not be displayed. Check status again or ask the operator to inspect the output.');
        }} />}
    </div>}
    {warning && <p role="status">{warning}</p>}
    <div className="landing-actions">
      {busy && <Button onClick={() => {
        controller.current?.abort(); thumbnailUrl.current.clear(); setThumbnail(null); setPhase('stopped');
      }}>Stop waiting</Button>}
      {!busy && asset.current && <Button onClick={() => void checkStatus()}>Check status again</Button>}
    </div>
    <p className="source-note">Closing or stopping cancels browser requests, not backend jobs. Registration and single-use uploads are never retried automatically.</p>
  </div>;
}
