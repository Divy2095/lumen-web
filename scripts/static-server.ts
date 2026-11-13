import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { basePath } from "../site.config.ts";

const root = resolve("build/client");
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".wasm": "application/wasm", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

// Development/test tool only: serves existing files, never rewrites to index.html.
export function createStaticServer() {
  return createServer(async (request, response) => {
    async function notFound() {
      response.writeHead(404, { "Content-Type": mime[".html"] });
      response.end(await readFile(resolve(root, "404.html")));
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
      if (pathname === basePath.slice(0, -1)) {
        response.writeHead(301, { Location: basePath }); response.end(); return;
      }
      if (!pathname.startsWith(basePath)) { await notFound(); return; }
      let file = resolve(root, pathname.slice(basePath.length));
      if (file !== root && !file.startsWith(root + sep)) { await notFound(); return; }
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith("/")) {
          response.writeHead(301, { Location: `${pathname}/${new URL(request.url!, "http://localhost").search}` });
          response.end(); return;
        }
        file = resolve(file, "index.html");
      }
      const body = await readFile(file);
      response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "ENOTDIR") {
        await notFound();
      } else { response.writeHead(500); response.end("Static preview failed"); }
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT ?? 4173);
  createStaticServer().listen(port, "127.0.0.1", () => console.log(`Static preview: http://127.0.0.1:${port}${basePath} (no SPA fallback)`));
}
