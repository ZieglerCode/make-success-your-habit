import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { installGlobals } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/express";
import express from "express";

installGlobals({ nativeFetch: true });

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(appRoot, "build", "server");
const serverBuilds = readdirSync(serverRoot)
  .map((name) => path.join(serverRoot, name, "index.js"))
  .filter((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  });

if (serverBuilds.length !== 1) {
  throw new Error(
    `Expected exactly one Webstudio Node server bundle, found ${serverBuilds.length}`
  );
}

process.chdir(appRoot);

const build = await import(pathToFileURL(serverBuilds[0]).href);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.get("/healthz", (_request, response) => response.status(200).send("ok"));
app.use(
  build.publicPath,
  express.static(build.assetsBuildDirectory, {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(express.static("public", { maxAge: "1h" }));
app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV ?? "production",
  })
);

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[webstudio-selfhost] listening on http://0.0.0.0:${port}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.once(signal, () => server.close());
}
