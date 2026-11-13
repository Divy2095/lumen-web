import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { basePath, documents } from "../site.config.ts";
import type { DocumentEntry } from "../app/content/manifest.ts";
import { markdownHeadings } from "./document-headings.ts";

export const committedApiRoutes = ['GET /health','GET /ready','POST /v1/media','PUT /v1/media/:id/upload','GET /v1/media/:id','GET /v1/media/:id/thumbnail'];
function withoutFences(source:string) { let fenced=false;return source.split('\n').filter(line=>{if(/^```/.test(line)){fenced=!fenced;return false;}return !fenced;}).join('\n'); }

export function validateInventory(entries:readonly DocumentEntry[],sources:Map<string,string>,routeFiles:Set<string>) {
  const paths=new Set<string>(),slugs=new Set<string>();
  for(const doc of entries){
    assert(doc.title.trim()&&doc.description.trim()&&doc.group.trim(),`Missing title/description/navigation group: ${doc.slug}`);
    assert(/^docs(?:\/[a-z0-9-]+)*$/.test(doc.path),`Invalid path: ${doc.path}`);
    assert(!paths.has(doc.path),`Duplicate path: ${doc.path}`);paths.add(doc.path);
    assert(!slugs.has(doc.slug),`Duplicate slug: ${doc.slug}`);slugs.add(doc.slug);
    assert(routeFiles.has(doc.file),`Missing route module: ${doc.file}`);
    assert(doc.sources.length>0,`Missing provenance: ${doc.slug}`);
    const source=sources.get(doc.slug);assert(source,`Missing content: ${doc.slug}`);
    const titles=[...withoutFences(source).matchAll(/^# (.+)$/gm)].map(match=>match[1]);
    assert.deepEqual(titles,[doc.title],`Missing/mismatched page title: ${doc.slug}`);
    assert(markdownHeadings(source).length>0,`No headings: ${doc.slug}`);
    for(const match of source.matchAll(/\b(GET|POST|PUT|PATCH|DELETE) (\/(?:v1\/[^\s\x60<>"')]+|health|ready))/g)){
      assert(committedApiRoutes.includes(`${match[1]} ${match[2].replace(/[.,;]$/,'')}`),`Incorrect API reference in ${doc.slug}: ${match[0]}`);
    }
  }
  assert.deepEqual([...sources.keys()].sort(),[...slugs].sort(),'Missing navigation entry or orphan content');
  assert.deepEqual([...routeFiles].sort(),entries.map(doc=>doc.file).sort(),'Missing navigation entry or orphan route');
  assert.deepEqual(entries.filter(doc=>doc.group==='API reference').map(doc=>doc.endpoint).sort(),[...committedApiRoutes].sort(),'API reference coverage differs from committed routes');
  const headingMap=new Map(entries.map(doc=>[doc.path,new Set(markdownHeadings(sources.get(doc.slug)!).map(h=>h.id))]));
  for(const doc of entries){
    for(const match of withoutFences(sources.get(doc.slug)!).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) validateLink(match[1],doc.path,headingMap);
  }
}
function validateLink(href:string,sourcePath:string,headings:Map<string,Set<string>>) {
  if(/^(https?:|mailto:)/.test(href))return;
  const normalized=href.startsWith('/docs/')?basePath+href.slice(1):href;
  const url=new URL(normalized,`https://docs.local${basePath}${sourcePath}/`);
  assert(url.pathname.startsWith(basePath),`Link escapes base: ${href}`);
  const path=url.pathname.slice(basePath.length).replace(/\/$/,'');
  if(path==='') {if(url.hash)assert(['pipeline','capabilities','developer-experience','architecture','getting-started','project-status','main','hero-title'].includes(url.hash.slice(1)),`Broken home anchor: ${href}`);return;}
  assert(headings.has(path),`Broken internal documentation link from ${sourcePath}: ${href}`);
  if(url.hash)assert(headings.get(path)!.has(decodeURIComponent(url.hash.slice(1))),`Broken heading anchor from ${sourcePath}: ${href}`);
}

export async function validateSources(){
  const sources=new Map<string,string>();
  for(const file of await readdir('app/content/docs')){assert(file.endsWith('.mdx'),`Unexpected content file: ${file}`);sources.set(file.slice(0,-4),await readFile(`app/content/docs/${file}`,'utf8'));}
  const files=new Set((await readdir('app/routes/docs')).map(file=>`routes/docs/${file}`));
  validateInventory(documents,sources,files);
  for(const doc of documents){
    const module=await readFile(`app/${doc.file}`,'utf8');
    assert(module.includes(`content/docs/${doc.slug}.mdx`),`Route imports wrong document: ${doc.path}`);
    assert(module.includes(doc.title),`Route metadata missing title: ${doc.path}`);
  }
  return sources;
}
export async function validateOutput(){
  const sources=await validateSources();
  const pages=new Map<string,string>();
  for(const doc of documents){
    const html=await readFile(`build/client/${doc.path}/index.html`,'utf8');
    assert(html.includes('data-pagefind-body'),`Missing indexed body: ${doc.path}`);
    assert(html.includes(doc.title),`Missing rendered title: ${doc.path}`);
    const article=html.match(/<article[^>]*>([\s\S]*?)<\/article>/)?.[1]??'';
    assert(article.includes(doc.description),`Missing prerendered article description: ${doc.path}`);
    assert(html.includes('Runtime not verified'),`Missing evidence status: ${doc.path}`);
    const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
    for(const heading of markdownHeadings(sources.get(doc.slug)!))assert(ids.has(heading.id),`Missing rendered anchor ${doc.path}#${heading.id}`);
    pages.set(doc.path,html);
  }
  const ids=new Map([...pages].map(([path,html])=>[path,new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))]));
  for(const [path,html] of pages)for(const match of html.matchAll(/href="([^"]+)"/g)){
    const href=match[1];
    if(href.startsWith(`${basePath}assets/`)){await readFile(`build/client/${href.slice(basePath.length)}`);continue;}
    validateLink(href,path,ids);
  }
  const entry=JSON.parse(await readFile('build/client/pagefind/pagefind-entry.json','utf8'));
  assert.equal(entry.languages.en.page_count,documents.length,'Pagefind page count differs from manifest');
  console.log(`Validated ${documents.length} rendered documents, links, anchors and Pagefind page count.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv[2]==='output')await validateOutput();
  else {await validateSources();console.log(`Validated ${documents.length} source documents and six API contracts.`);}
}
