import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2] === "lab" ? "lab" : "prod";
const port = Math.max(1, Math.min(65535, Number(process.argv[3]) || 4173));
const publicRoot = path.join(ROOT, "dist", target);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".wav": "audio/wav"
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relative = pathname.endsWith("/") ? pathname + "index.html" : pathname;
    const absolute = path.resolve(publicRoot, "." + relative);
    if (absolute !== publicRoot && !absolute.startsWith(publicRoot + path.sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const info = await stat(absolute);
    if (!info.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(absolute)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(absolute).pipe(response);
  } catch (error) {
    response.writeHead(404).end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(
    "Serving " + target + " at http://127.0.0.1:" + String(port) + "/"
  );
});
