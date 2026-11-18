import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { validateVideo } from './playground-api';
const Authentication=lazy(()=>import('./playground-auth'));
class AuthError extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<p role="alert">Authentication is unavailable. Close this dialog and try again.</p>:this.props.children;}
}
export function VideoSelection({onChange}:{onChange:(file:File|null)=>void}){
 const [file,setFile]=useState<File|null>(null);const [error,setError]=useState('');const [drag,setDrag]=useState(false);const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{function prevent(event:DragEvent){if(event.dataTransfer?.types.includes('Files'))event.preventDefault();}window.addEventListener('dragover',prevent);window.addEventListener('drop',prevent);return()=>{window.removeEventListener('dragover',prevent);window.removeEventListener('drop',prevent);};},[]);
 function select(files:File[]){
  const next=files[0];let message='';
  if(files.length!==1)message='Choose one MP4 video at a time.';
  else message=validateVideo(next);
  setError(message);setFile(message?null:next);onChange(message?null:next);
 }
 return <div className="video-selection" data-dragging={drag} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setDrag(false);}} onDrop={e=>{e.preventDefault();setDrag(false);select(Array.from(e.dataTransfer.files));if(input.current)input.current.value='';}}>
  <label htmlFor="playground-file">Choose an MP4 video</label><p id="video-help">Drop one file here, or use the file picker. Maximum 25 MiB for this playground.</p>
  <input ref={input} id="playground-file" type="file" accept="video/mp4,.mp4" aria-describedby="video-help video-error" aria-invalid={Boolean(error)} onChange={e=>{if(e.currentTarget.files?.length)select(Array.from(e.currentTarget.files));}}/>
  <p id="video-error" role="alert">{error}</p>
  <div role="status">{file?<p className="selected-video">{file.name} · {file.size<1024*1024?`${Math.max(1,Math.ceil(file.size/1024))} KiB`:`${(file.size/1024/1024).toFixed(1)} MiB`}</p>:<p>No video selected.</p>}</div>
  {file&&<div className="landing-actions"><Button onClick={()=>input.current?.click()}>Replace video</Button><Button onClick={()=>{setFile(null);setError('');onChange(null);if(input.current){input.current.value='';input.current.focus();}}}>Remove video</Button></div>}
 </div>;
}
export function Playground(){
 const [file,setFile]=useState<File|null>(null);const [open,setOpen]=useState(false);
 const key=import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();const configured=Boolean(key&&/^pk_(test|live)_/.test(key));
 return <section className="landing-section playground-section" id="playground" aria-labelledby="playground-title">
  <div className="section-heading"><div><p className="section-index">Local processing demo</p><h2 id="playground-title">Start with your video.</h2></div><p>Sign in, upload an MP4 to your configured Lumen API, and retrieve real metadata and a generated thumbnail. Requires the local Phase 8C backend.</p></div>
  <VideoSelection onChange={next=>{setOpen(false);setFile(next);}}/><div className="playground-next"><Button variant="primary" disabled={!file} aria-describedby="process-help" onClick={()=>setOpen(true)}>Process video</Button><p id="process-help">{file?'If signed in, this sends the selected file to your configured API.':'Select a valid MP4 to continue.'}</p></div>
  <p className="source-note">25 MiB playground limit. The backend independently validates MP4 bytes. No project API keys are used in this browser.</p>
  <Modal open={open} onClose={()=>setOpen(false)} title="Ready to process your video?" className="playground-modal"><div className="playground-dialog-body">
   {open&&file&&(configured?<AuthError><Suspense fallback={<p role="status">Loading authentication…</p>}><Authentication file={file}/></Suspense></AuthError>:<><p>Authentication is unavailable because Clerk is not configured for this preview.</p><p>You can keep selecting files locally. No upload or processing will occur.</p></>)}
   <Button onClick={()=>setOpen(false)}>Not now</Button></div></Modal>
 </section>;
}
