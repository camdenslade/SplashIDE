const http = require("http");

http.createServer(async (req, res) => {
  if (req.url === "/run" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { prompt } = JSON.parse(body);

      const result = await fetchLLM(prompt);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ output: result }));
    });
  }
}).listen(3009);
