import { test } from 'node:test';
import assert from 'node:assert/strict';
import { documents } from '../site.config.ts';
import { readFile } from 'node:fs/promises';
import { validateInventory,validateSources } from './validate-docs.ts';
import { markdownHeadings } from './document-headings.ts';
const source=await validateSources();
const routes=new Set(documents.map(doc=>doc.file));
test('complete manifest and source inventory validate',()=>validateInventory(documents,source,routes));
test('duplicate paths, missing titles and missing navigation entries fail',()=>{
 assert.throws(()=>validateInventory([...documents,documents[0]],source,routes),/Duplicate/);
 assert.throws(()=>validateInventory([{...documents[0],title:''},...documents.slice(1)],source,routes),/Missing title/);
 assert.throws(()=>validateInventory(documents.slice(1),source,routes),/Missing navigation entry/);
});
test('incorrect API route references fail',()=>{
 const altered=new Map(source);altered.set(documents[0].slug,source.get(documents[0].slug)!+'\nGET /v1/jobs\n');
 assert.throws(()=>validateInventory(documents,altered,routes),/Incorrect API reference/);
});
test('broken documentation links and heading anchors fail',()=>{
 for(const href of ['/docs/absent/','/docs/getting-started/installation/#absent']){
  const altered=new Map(source);altered.set(documents[0].slug,source.get(documents[0].slug)!+`\n[Broken](${href})\n`);
  assert.throws(()=>validateInventory(documents,altered,routes),/Broken/);
 }
});
test('heading IDs are deterministic, fences excluded, duplicates rejected',()=>{
 assert.deepEqual(markdownHeadings('## Real heading\n```bash\n## Not a heading\n```'),[{id:'real-heading',title:'Real heading',level:2}]);
 assert.throws(()=>markdownHeadings('## Duplicate\n## Duplicate'),/Duplicate/);
});
test('each route statically imports its matching document',async()=>{
 for(const doc of documents)assert((await readFile(`app/${doc.file}`,'utf8')).includes(`content/docs/${doc.slug}.mdx`));
});
