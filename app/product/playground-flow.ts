import { PlaygroundError, type MediaStatus, type PlaygroundApi } from './playground-api.ts';

function pause(ms: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const finish = () => { signal.removeEventListener('abort', abort); resolve(); };
    const timer = setTimeout(finish, ms);
    const abort = () => { clearTimeout(timer); reject(new DOMException('Stopped', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
  });
}

export async function pollMedia(api: Pick<PlaygroundApi, 'status'>, id: string, signal: AbortSignal,
  onStatus: (status: MediaStatus) => void, options: { intervalMs?: number; timeoutMs?: number } = {}): Promise<MediaStatus> {
  const deadline = Date.now() + (options.timeoutMs ?? 180_000);
  // This also aborts an in-flight request when the polling deadline expires.
  const bounded = AbortSignal.any([signal, AbortSignal.timeout(options.timeoutMs ?? 180_000)]);
  let failures = 0;
  try {
    do {
      bounded.throwIfAborted();
      let status: MediaStatus;
      try { status = await api.status(id, bounded); failures = 0; }
      catch (error) {
        if (!(error instanceof PlaygroundError) || !error.retryable || ++failures > 3) throw error;
        await pause(options.intervalMs ?? 2000, bounded);
        continue;
      }
      bounded.throwIfAborted();
      onStatus(status);
      if (['failed', 'deleting', 'deleted'].includes(status.status) ||
          status.processing.some(job => job.status === 'failed' || job.status === 'cancelled')) {
        throw new PlaygroundError('Upload or processing failed/cancelled. Available metadata is shown below. Ask the operator to inspect the job before starting a new upload.');
      }
      const metadataDone = status.processing.some(job => job.operation === 'extract_metadata' && job.status === 'completed');
      const thumbnailDone = status.processing.some(job => job.operation === 'generate_thumbnail' && job.status === 'completed');
      if (status.status === 'ready' && metadataDone && thumbnailDone) return status;
      await pause(options.intervalMs ?? 2000, bounded);
    } while (Date.now() < deadline);
  } catch (error) {
    signal.throwIfAborted();
    if (!bounded.aborted) throw error;
  }
  throw new PlaygroundError('Processing has not been confirmed within three minutes. The backend may still be working. Check status again; do not upload again.');
}

export class ThumbnailUrl {
  private url: string | null = null;
  replace(blob: Blob, signal: AbortSignal): string {
    signal.throwIfAborted();
    this.clear();
    this.url = URL.createObjectURL(blob);
    return this.url;
  }
  clear() { if (this.url) URL.revokeObjectURL(this.url); this.url = null; }
}

export function formatMetadata(status: MediaStatus): { label: string; value: string }[] {
  const t = status.technical;
  const number = (value: number | null, unit: string) => value === null ? 'Not available' : `${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)} ${unit}`;
  return [
    { label: 'Duration', value: number(t.duration_seconds, 's') },
    { label: 'Resolution', value: t.width && t.height ? `${t.width} × ${t.height}` : 'Not available' },
    { label: 'Video codec', value: t.video_codec ?? 'Not available' },
    { label: 'Audio codec', value: t.audio_codec ?? 'Not available' },
    { label: 'Bitrate', value: number(t.bitrate === null ? null : t.bitrate / 1000, 'kb/s') },
    { label: 'Frame rate', value: number(t.frame_rate, 'fps') },
    { label: 'File size', value: number(status.file_size_bytes / (1024 * 1024), 'MiB') },
  ];
}
