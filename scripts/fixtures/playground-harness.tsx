// Test-only entry: bundled in memory for offline browser lifecycle tests, never a public route.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PlaygroundProcessing } from '../../app/product/playground-processing';

function Harness() {
  const [open, setOpen] = useState(true);
  const [file, setFile] = useState(() => new File(['test bytes'], 'clip.mp4', { type: 'video/mp4' }));
  return <>
    <button onClick={() => setOpen(false)}>Unmount playground</button>
    <button onClick={() => setFile(new File(['new bytes'], 'next.mp4', { type: 'video/mp4' }))}>New file</button>
    {open && <PlaygroundProcessing file={file} getToken={async () => 'test-session'} />}
  </>;
}
createRoot(document.getElementById('root')!).render(<Harness />);
