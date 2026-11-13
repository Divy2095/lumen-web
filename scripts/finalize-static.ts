import { access, cp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { basePath, documents } from "../site.config.ts";

export async function normalizeStaticOutput(clientDir = "build/client", serverDir = "build/server") {
  // Router 8.5 emits prefixed HTML beside unprefixed assets. Pages supplies the
  // repository prefix itself, so move only the generated document tree up once.
  const prefixed = join(clientDir, basePath.slice(1));
  // Check every expected document before touching the generated artifact.
  for (const path of ["", "auth-poc/", ...documents.map(doc => `${doc.path}/`)]) {
    await access(join(prefixed, path, "index.html"));
  }
  await access(join(clientDir, "404.html"));
  await cp(prefixed, clientDir, { recursive: true });
  await rm(prefixed, { recursive: true });
  // The prerender server is a build intermediate, never a deployment artifact.
  await rm(serverDir, { recursive: true, force: true });
  await writeFile(join(clientDir, ".nojekyll"), "");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await normalizeStaticOutput();
  console.log(`Static artifact ready: build/client mounted at ${basePath}`);
}
