import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import server from "./server.js";

const port = parseInt(process.env.PORT ?? "3010", 10);
const host = process.env.HOST ?? "0.0.0.0";

// Resolve the client dist directory relative to this file
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = join(__dirname, "..", "client");

const MIME_TYPES = {
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".map": "application/json",
};

async function serveStaticFile(pathname, res) {
  const filePath = join(clientDir, pathname);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const httpServer = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    // Serve static assets from dist/client
    if (req.method === "GET" && url.pathname.startsWith("/assets/")) {
      const served = await serveStaticFile(url.pathname, res);
      if (served) return;
    }

    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else {
          headers.set(key, value);
        }
      }
    }

    const bodyAllowed = !["GET", "HEAD"].includes(req.method ?? "GET");
    const body = bodyAllowed
      ? await new Promise((resolve) => {
          const chunks = [];
          req.on("data", (chunk) => chunks.push(chunk));
          req.on("end", () => resolve(Buffer.concat(chunks)));
        })
      : undefined;

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
      duplex: "half",
    });

    const response = await server.fetch(request);

    res.writeHead(
      response.status,
      Object.fromEntries(response.headers.entries()),
    );

    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        await pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

httpServer.listen(port, host, () => {
  console.log(`🃏 Guia da Roda running at http://${host}:${port}`);
});
