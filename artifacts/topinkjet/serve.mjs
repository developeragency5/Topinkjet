import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.env.PORT);
if (!PORT) {
  console.error("PORT environment variable is required");
  process.exit(1);
}

const ROOT = path.resolve(process.argv[2] || "site");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function send404(res) {
  const notFound = path.join(ROOT, "404.html");
  if (fs.existsSync(notFound)) {
    const data = fs.readFileSync(notFound);
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
}

// Cache policy:
//  - Hashed/long-lived assets (images, fonts) get a 30-day immutable cache
//    so repeat visits are instant.
//  - CSS/JS get 1 hour (we don't fingerprint, so we want updates to roll
//    out within an hour without forcing a hard refresh).
//  - HTML always revalidates so content edits show up immediately.
function cacheHeaderFor(ext) {
  if (ext === ".html") return "public, max-age=0, must-revalidate";
  if (ext === ".css" || ext === ".js" || ext === ".json") return "public, max-age=3600";
  if (/^\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?)$/.test(ext)) {
    return "public, max-age=2592000, immutable";
  }
  return "no-cache";
}

const server = http.createServer((req, res) => {
  try {
    const parsed = new URL(req.url || "/", "http://localhost");
    let pathname = decodeURIComponent(parsed.pathname || "/");
    // strip trailing slash except root
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname += "index.html";
    } else if (pathname === "/") {
      pathname = "/index.html";
    }
    let filePath = path.join(ROOT, pathname);
    if (!filePath.startsWith(ROOT)) {
      send404(res);
      return;
    }
    if (!fs.existsSync(filePath)) {
      // try .html fallback
      if (fs.existsSync(filePath + ".html")) {
        filePath = filePath + ".html";
      } else {
        send404(res);
        return;
      }
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      if (!fs.existsSync(filePath)) {
        send404(res);
        return;
      }
    }
    const ext = path.extname(filePath).toLowerCase();
    const ct = MIME[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": ct,
      "Cache-Control": cacheHeaderFor(ext),
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`TopInkjet static server listening on port ${PORT}, serving ${ROOT}`);
});
