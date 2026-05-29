import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import server from "./server.js";

const port = parseInt(process.env.PORT ?? "3010", 10);
const host = process.env.HOST ?? "0.0.0.0";
const CLIENT_DIR = join(process.cwd(), "dist", "client");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
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
  ".webp": "image/webp",
};

async function serveStaticFile(pathname) {
  // Only serve /assets/* paths
  if (!pathname.startsWith("/assets/")) return null;

  const filePath = join(CLIENT_DIR, pathname);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return null; // file not found, fall through to SSR
  }
}

const httpServer = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    // Try serving static files first
    const staticResponse = await serveStaticFile(url.pathname);
    if (staticResponse) {
      res.writeHead(staticResponse.status, Object.fromEntries(staticResponse.headers.entries()));
      const body = await staticResponse.arrayBuffer();
      res.end(Buffer.from(body));
      return;
    }

    // Fall through to TanStack Start handler
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
