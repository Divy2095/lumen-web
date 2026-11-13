import { ArrowDown } from "lucide-react";

export function Architecture() {
  return <section id="architecture" className="landing-section architecture-section" aria-labelledby="architecture-title">
    <div className="section-heading"><div><p className="section-index">04 / Architecture</p><h2 id="architecture-title">A pipeline you can<br />reason about.</h2></div><p>The API accepts work. PostgreSQL records it. A separate publisher and workers carry it through. You operate these services alongside local file storage.</p></div>
    <figure className="architecture-figure"><div className="architecture-flow">
      <div className="architecture-node"><span className="technical-label">Request boundary</span><h3>Fastify API</h3><p>Authenticate the project,<br />register and ingest MP4.</p></div>
      <ArrowDown aria-hidden="true" className="architecture-arrow" size={18} />
      <div className="architecture-node database-node"><span className="technical-label">Source of truth</span><h3>PostgreSQL</h3><p>Assets + jobs + outbox events,<br />committed together.</p></div>
      <ArrowDown aria-hidden="true" className="architecture-arrow" size={18} />
      <div className="architecture-node"><span className="technical-label">Dispatch</span><h3>Outbox publisher</h3><p>Publish pending job events<br />to Redis / BullMQ.</p></div>
      <ArrowDown aria-hidden="true" className="architecture-arrow" size={18} />
      <div className="architecture-node"><span className="technical-label">Execution</span><h3>Background workers</h3><p>Claim jobs with leases,<br />then run media tools.</p></div>
    </div>
      <div className="architecture-outputs"><p><strong>FFprobe</strong><span>Metadata → PostgreSQL</span></p><p><strong>FFmpeg</strong><span>JPEG → local storage + output record</span></p></div>
      <figcaption>Thumbnail files are served through an authenticated API route. This diagram describes the implementation; it is not a running service.</figcaption>
    </figure>
  </section>;
}
