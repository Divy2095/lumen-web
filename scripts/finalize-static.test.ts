import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeStaticOutput } from "./finalize-static.ts";
import { basePath, documents } from "../site.config.ts";

test("Pages normalization replaces SPA shell, preserves assets/404, and removes only generated intermediate trees", async () => {
  const temp = await mkdtemp(join(tmpdir(), "lumen-normalize-"));
  const client = join(temp, "client");
  const server = join(temp, "server");
  try {
    for (const path of ["", ...documents.map(doc => `${doc.path}/`)]) {
      const directory = join(client, basePath, path);
      await mkdir(directory, { recursive: true });
      await writeFile(join(directory, "index.html"), `prerendered:${path}`);
    }
    await mkdir(join(client, "assets"));
    await mkdir(join(server, "assets"), { recursive: true });
    await writeFile(join(server, "assets/server-only.js"), "must not publish");
    await writeFile(join(client, "index.html"), "SPA fallback must be replaced");
    await writeFile(join(client, "404.html"), "real 404");
    await writeFile(join(client, "assets/site.js"), "asset");
    await writeFile(join(temp, "unrelated"), "preserve");
    await normalizeStaticOutput(client, server);
    assert.equal(await readFile(join(client, "index.html"), "utf8"), "prerendered:");
    for (const doc of documents) assert.equal(await readFile(join(client, doc.path, "index.html"), "utf8"), `prerendered:${doc.path}/`);
    assert.equal(await readFile(join(client, "404.html"), "utf8"), "real 404");
    assert.equal(await readFile(join(client, "assets/site.js"), "utf8"), "asset");
    assert.ok(!(await readdir(join(client, "assets"))).includes("server-only.js"));
    assert.equal(await readFile(join(temp, "unrelated"), "utf8"), "preserve");
    assert.ok((await readdir(client)).includes(".nojekyll"));
    await assert.rejects(readFile(join(server, "index.js")), { code: "ENOENT" });
    assert.ok(!(await readdir(temp)).includes("server"));
    assert.ok(!(await readdir(client)).includes("lumen-web"));
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test("missing prefixed output fails before replacing existing files", async () => {
  const temp = await mkdtemp(join(tmpdir(), "lumen-normalize-"));
  try {
    await writeFile(join(temp, "index.html"), "original");
    await assert.rejects(normalizeStaticOutput(temp, join(temp, "server")), { code: "ENOENT" });
    assert.equal(await readFile(join(temp, "index.html"), "utf8"), "original");
  } finally { await rm(temp, { recursive: true, force: true }); }
});
