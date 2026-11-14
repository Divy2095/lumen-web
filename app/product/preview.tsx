import { FileVideo, FileJson, Image, Layers } from 'lucide-react';
import { Link } from 'react-router';
export function ProductPreview(){
 return <section className="landing-section product-preview" id="product-preview" aria-labelledby="preview-title">
  <div className="section-heading"><div><p className="section-index">01 / Product preview</p><h2 id="preview-title">One upload.<br/>Multiple useful outputs.</h2></div><p>An example of the information video processing can produce. These categories are independent, not a sequence of jobs.</p></div>
  <div className="output-panel"><div className="output-toolbar"><span className="technical-label">Example output</span><span className="status-badge">Illustrative</span></div>
   <div className="output-source"><FileVideo size={28} strokeWidth={1.5} aria-hidden="true"/><div><strong>sample-video.mp4</strong><p>1920 × 1080 · H.264 · 24 fps</p></div><span className="ingestion-label">Ingestion complete <small>Example asset state only</small></span></div>
   <div className="output-categories">
    <section aria-labelledby="output-metadata"><h3 id="output-metadata"><FileJson size={18} aria-hidden="true"/>Metadata</h3><dl><div><dt>Duration</dt><dd>00:12</dd></div><div><dt>Dimensions</dt><dd>1920 × 1080</dd></div><div><dt>Codec / frame rate</dt><dd>H.264 / 24 fps</dd></div></dl><p>Example values; metadata is persisted internally in the current source baseline.</p></section>
    <section aria-labelledby="output-thumbnail"><h3 id="output-thumbnail"><Image size={18} aria-hidden="true"/>Thumbnail</h3><div className="thumbnail-example"><svg viewBox="0 0 240 90" role="img" aria-label="Illustration of a JPEG thumbnail, not generated from an upload"><rect width="240" height="90" fill="currentColor" opacity=".06"/><path d="M0 72 56 32 100 61 152 22 240 76" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="193" cy="23" r="8" fill="none" stroke="currentColor"/></svg><span>sample-video.jpg · Example frame</span></div><p>Generated JPEG output, retrieved with authentication in the current API.</p></section>
    <section aria-labelledby="output-renditions"><h3 id="output-renditions"><Layers size={18} aria-hidden="true"/>Renditions</h3><span className="status-badge">In development</span><p>Optimized video outputs at different sizes. Outside the currently documented API; no rendition has been generated here.</p></section>
   </div>
   <p className="output-note">Ingestion complete does not mean processing is finished. Metadata, thumbnails and future renditions have separate processing states. No backend is connected.</p>
  </div><Link className="text-link preview-doc-link" to="/docs/guides/processing/#explore-the-flow">Explore the detailed processing flow</Link>
 </section>;
}
