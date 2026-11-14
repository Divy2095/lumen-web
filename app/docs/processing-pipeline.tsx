import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, ArrowDown, Check } from "lucide-react";
import { Button } from "../ui/button";

import "./processing-pipeline.css";

const steps = [
  { title: "Register media", detail: "API key authenticates the project and its MP4 upload intent.", technical: "POST /v1/media" },
  { title: "Issue upload token", detail: "Return a single-use credential and an asset-specific upload URL.", technical: "201 · asset: uploading" },
  { title: "Validate & store", detail: "Claim the token, check the MP4 stream and commit the uploaded file.", technical: "PUT /v1/media/:id/upload" },
  { title: "Commit processing work", detail: "Mark ingestion ready and create jobs plus outbox events in one database transaction.", technical: "PostgreSQL transaction" },
  { title: "Dispatch to workers", detail: "The outbox publisher sends work to Redis/BullMQ for background workers.", technical: "Outbox → BullMQ" },
];
const frames = [
  { step: 0, asset: "uploading", metadata: "not queued", thumbnail: "not queued", message: "A project API key registers the media asset." },
  { step: 1, asset: "uploading", metadata: "not queued", thumbnail: "not queued", message: "Registration returns an upload token. It is separate from the project API key." },
  { step: 2, asset: "uploading", metadata: "not queued", thumbnail: "not queued", message: "The upload token is consumed as the MP4 upload is claimed and validated." },
  { step: 3, asset: "ready", metadata: "queued", thumbnail: "queued", message: "Ingestion is ready. Both processing jobs are still queued." },
  { step: 4, asset: "ready", metadata: "queued", thumbnail: "queued", message: "The publisher dispatches committed job records through BullMQ." },
  { step: 5, asset: "ready", metadata: "processing", thumbnail: "processing", message: "Workers execute metadata and thumbnail jobs independently." },
  { step: 5, asset: "ready", metadata: "completed", thumbnail: "processing", message: "In this illustrative ordering, metadata finishes first. The thumbnail is still processing." },
  { step: 5, asset: "ready", metadata: "completed", thumbnail: "completed", message: "The JPEG and its output record are available. Job completion order is not guaranteed." },
  { step: 6, asset: "ready", metadata: "completed", thumbnail: "completed", message: "An authenticated request retrieves the generated JPEG. Metadata remains persisted internally." },
];

export function Pipeline() {
  const [frame, setFrame] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(media.matches); if (media.matches) { setPlaying(false); setFrame(-1); } };
    update(); setReady(true);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing || reduced) return;
    if (frame === frames.length - 1) {
      setPlaying(false);
      setAnnouncement("Simulation complete. Ingestion and both independent jobs are complete in this example.");
      return;
    }
    const timer = window.setTimeout(() => setFrame(value => value + 1), 1200);
    return () => clearTimeout(timer);
  }, [playing, frame, reduced]);
  const current = frame < 0 ? null : frames[frame];
  const complete = frame === frames.length - 1;
  function play() {
    if (playing) { setPlaying(false); setAnnouncement(`Simulation paused. ${current?.message ?? ""}`); }
    else {
      if (frame < 0 || complete) setFrame(0);
      setPlaying(true);
      setAnnouncement("Simulation playing. Illustrative states will advance; no backend is connected.");
    }
  }
  const state = (step: number) => !current ? "overview" : step < current.step ? "complete" : step === current.step ? "active" : "waiting";
  return <section className="landing-section pipeline-section" id="pipeline" aria-labelledby="pipeline-title">
    <div className="section-heading"><div><p className="section-index">01 / The processing flow</p><h2 id="pipeline-title">From upload intent<br />to useful output.</h2></div>
      <p>Ingestion is one step. Processing is another. Follow how an MP4 becomes a stored asset, metadata and a thumbnail.</p></div>
    <div className="pipeline-panel">
      <div className="pipeline-toolbar"><div><span className="technical-label">Illustrative simulation</span><p>No files are uploaded and no backend is connected.</p></div>
        {!reduced && <div className="pipeline-controls"><Button variant="secondary" onClick={play} disabled={!ready}>{playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}{playing ? "Pause simulation" : complete ? "Replay simulation" : frame < 0 ? "Play simulation" : "Resume simulation"}</Button>
          <Button variant="ghost" aria-label="Reset simulation" disabled={!ready || frame < 0} onClick={() => { setPlaying(false); setFrame(-1); setAnnouncement("Simulation reset to the static overview."); }}><RotateCcw size={15} aria-hidden="true" /></Button></div>}
      </div>
      {reduced && <p className="pipeline-motion-note">Reduced motion: static overview. Every stage is shown below.</p>}
      <noscript><p className="pipeline-motion-note">Static overview. All stages are readable without JavaScript.</p></noscript>
      <ol className="pipeline-flow">{steps.map((step, index) => <li key={step.title} data-state={state(index)}>
        <div className="pipeline-stage-label"><span className="step-number">{state(index) === "complete" ? <Check size={12} aria-hidden="true" /> : String(index + 1).padStart(2, "0")}</span><span>{state(index) === "overview" ? "" : state(index)}</span></div>
        <h3>{step.title}</h3><p>{step.detail}</p><code>{step.technical}</code>
      </li>)}</ol>
      <div className="worker-branches" data-state={state(5)}><p className="branch-label"><ArrowDown size={14} aria-hidden="true" />06 / Independent worker jobs</p>
        <div className="worker-pair"><div><div className="worker-heading"><h3>Extract metadata</h3><span className="technical-label">FFprobe</span></div><p>Persist duration, dimensions, codecs and frame rate in PostgreSQL.</p></div>
          <div><div className="worker-heading"><h3>Generate thumbnail</h3><span className="technical-label">FFmpeg</span></div><p>Write a JPEG to local storage and record the current output.</p></div></div>
      </div>
      <div className="pipeline-states" aria-label="Illustrative asset and job states">
        <div><span>Asset ingestion</span><strong>{current?.asset ?? "ready"}</strong><small>{current ? "Ingestion state" : "Means ingestion complete"}</small></div>
        <div><span>Metadata job</span><strong>{current?.metadata ?? "independent"}</strong><small>{current ? "Separate job state" : "May still be processing"}</small></div>
        <div><span>Thumbnail job</span><strong>{current?.thumbnail ?? "independent"}</strong><small>{current ? "Separate job state" : "May still be processing"}</small></div>
      </div>
      <div className="retrieval-stage" data-state={state(6)}><span className="step-number">07</span><div><h3>Retrieve the thumbnail</h3><p><code>GET /v1/media/:id/thumbnail</code> uses the project API key. Check thumbnail availability through <code>GET /v1/media/:id</code>.</p></div></div>
      <p className="pipeline-caption">{current?.message ?? "Read the full flow above, or play an example. Asset ready does not mean all processing is finished."}</p>
      <p role="status" aria-atomic="true" className="sr-only">{announcement}</p>
    </div>
  </section>;
}
