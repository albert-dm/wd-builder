import { createServer } from "node:http";
import server from "./server.js";

const port = parseInt(process.env.PORT ?? "3010", 10);
const host = process.env.HOST ?? "0.0.0.0";

const httpServer = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
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
