// Tiny static file server, no dependencies needed.
// Web Bluetooth requires a "secure context" (https, or http://localhost) —
// opening index.html directly as a file:// URL will not work in Chrome/Edge.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5050;

http
  .createServer((req, res) => {
    const filePath = req.url === "/" ? "/index.html" : req.url;
    const fullPath = path.join(__dirname, filePath);

    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(fullPath);
      const contentType = ext === ".html" ? "text/html" : "text/plain";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`BLE test page: http://localhost:${PORT}`);
  });
