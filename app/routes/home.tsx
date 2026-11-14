import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, FileVideo, FileJson, Image as ImageIcon } from "lucide-react";
import { docsPath, githubUrl } from "../../site.config";
import { CodeBlock } from "../components";
import { Playground } from "../product/playground";
import { ProductPreview } from "../product/preview";
import { Architecture } from "../product/architecture";
import ApiExample from "../product/api-example.mdx";
import "../product/landing.css";

export function meta() {
  return [
    { title: "Lumen — Video processing, through an API." },
    { name: "description", content: "An early-development, API-first video-processing platform. Register MP4 uploads, extract metadata and generate JPEG thumbnails with background workers." },
  ];
}

function HeroSchematic() {
  return <figure className="hero-schematic" aria-label="MP4 processing model"><div className="schematic-heading"><span className="technical-label">Processing model</span><span>MP4 in. Useful output out.</span></div>
    <div className="schematic-source"><FileVideo size={27} strokeWidth={1.5} aria-hidden="true" /><div><strong>source.mp4</strong><span>Registered · validated · stored</span></div><span className="file-type">MP4</span></div>
    <div className="schematic-route"><code>API</code><span aria-hidden="true" /><code>Queue</code><span aria-hidden="true" /><code>Workers</code></div>
    <div className="schematic-outputs"><div><FileJson size={21} strokeWidth={1.5} aria-hidden="true" /><strong>Metadata</strong><span>FFprobe → PostgreSQL</span></div><div><ImageIcon size={21} strokeWidth={1.5} aria-hidden="true" /><strong>JPEG thumbnail</strong><span>FFmpeg → local storage</span></div></div>
    <figcaption>Conceptual flow. Outputs have independent processing states.</figcaption>
  </figure>;
}

function Capabilities() {
  return <section className="landing-section capabilities-section" id="capabilities" aria-labelledby="capabilities-title">
    <div className="section-heading"><div><p className="section-index">02 / Core capabilities</p><h2 id="capabilities-title">The essential work,<br />behind one API.</h2></div><p>A focused starting point for developers building video into their products. Each capability below is grounded in committed source.</p></div>
    <div className="capability-row"><span className="capability-number">01</span><h3>Authenticate the intent.</h3><div><p>Register media with a project API key. Receive an asset-specific, single-use upload token that is separate from your project credentials.</p><span className="technical-label">Project ownership · Expiring upload tokens</span></div></div>
    <div className="capability-row"><span className="capability-number">02</span><h3>Ingest the source.</h3><div><p>Stream MP4 bytes with a matching declared size. Validate the upload and store the source file before scheduling processing work.</p><span className="technical-label">MP4 only · Maximum 100 MiB · Raw binary upload</span></div></div>
    <div className="capability-row"><span className="capability-number">03</span><h3>Let workers process it.</h3><div><p>BullMQ dispatches background jobs. FFprobe extracts metadata for internal persistence; FFmpeg generates a JPEG thumbnail for authenticated retrieval.</p><span className="technical-label">Independent jobs · Asset and thumbnail state</span></div></div>
    <p className="capability-footnote">Metadata persistence is implemented; a comprehensive public metadata response is not exposed by this revision. Transcoding is development work outside the committed flow shown here.</p>
  </section>;
}

function DeveloperExperience() {
  return <section className="landing-section developer-section" id="developer-experience" aria-labelledby="developer-title">
    <div className="section-heading"><div><p className="section-index">03 / Developer experience</p><h2 id="developer-title">Two steps.<br />Two different credentials.</h2></div><p>First, your application registers the upload. Then the file is sent using its own upload token. Your project key stays on your server.</p></div>
    <ApiExample components={{ pre: CodeBlock }} />
    <p className="source-note">Examples checked against <a href={`${githubUrl}/blob/4899210e659864a2026b13b7d3c558e92da08780/src/modules/media/media.service.ts`}>committed source <code>4899210</code><ArrowUpRight size={12} aria-hidden="true" /></a>. Values are illustrative; this website does not make API requests. See current setup limitations below.</p>
  </section>;
}

function GettingStarted() {
  return <section className="landing-section getting-started-section" id="getting-started" aria-labelledby="getting-started-title">
    <div><p className="section-index">05 / Getting started</p><h2 id="getting-started-title">Start with the source.</h2><p>Explore the code and documentation before running Lumen locally. Bring PostgreSQL, Redis and FFmpeg/FFprobe; run the API, publisher and workers separately.</p>
      <div className="landing-actions"><Link to={docsPath} className="button button-primary">Open documentation<ArrowRight size={16} aria-hidden="true" /></Link><a href={githubUrl} className="text-link">Explore the repository<ArrowUpRight size={14} aria-hidden="true" /></a></div>
    </div>
    <aside className="project-status" id="project-status" aria-labelledby="project-status-title"><span className="technical-label">Project status</span><h3 id="project-status-title">Early development</h3><p>Capabilities described here exist in source; they have not been runtime-verified for this website.</p><ul><li>Clean-checkout onboarding is not yet verified. An imported local-storage module is absent from the inspected commit.</li><li>A supported project/API-key provisioning walkthrough is still needed.</li><li>The setup guide documents these blockers; a complete local walkthrough is not yet runtime-verified.</li></ul><a href={`${githubUrl}/tree/4899210e659864a2026b13b7d3c558e92da08780`} className="text-link">Inspect the referenced revision<ArrowUpRight size={13} aria-hidden="true" /></a></aside>
  </section>;
}

export default function Home() {
  return <div className="landing-page">
    <section className="landing-hero" aria-labelledby="hero-title"><div className="hero-copy"><a href="#project-status" className="development-link"><span aria-hidden="true" />Early development<ArrowUpRight size={13} aria-hidden="true" /></a>
      <h1 id="hero-title">Video processing,<br />through an API.</h1>
      <p className="hero-description">Register and upload MP4 video. Extract metadata and generate JPEG thumbnails with background workers.</p>
      <div className="landing-actions"><Link to={docsPath} className="button button-primary">Get Started<ArrowRight size={16} aria-hidden="true" /></Link><a href={githubUrl} className="button button-secondary">GitHub<ArrowUpRight size={15} aria-hidden="true" /></a></div>
      <p className="hero-footnote">Open source. API-first. Built for developers.</p>
    </div><HeroSchematic /></section>
    <nav className="landing-section-nav" aria-label="On this page"><a href="#product-preview">Example outputs</a><a href="#capabilities">Capabilities</a><a href="#developer-experience">API workflow</a><a href="#architecture">Architecture</a><a href="#getting-started">Get started</a></nav>
    <ProductPreview /><Capabilities /><Playground /><DeveloperExperience /><Architecture /><GettingStarted />
  </div>;
}
