import http from "http";
import { getStatus, loop, send } from "./cronHH.js";

http
  .createServer(function (request, response) {
    let body = "";
    if (request.url === "/send") {
      body = `
        <a href="/">Back</a>
        <div>Sended...</div>F
      `;
      setTimeout(async () => {
        await loop();
      }, 0);
    } else {
      body = `
        <a href="/send">Send</a>
        <pre>${JSON.stringify(getStatus(), null, 2)}</pre>
      `;
    }

    response.statusCode = 200;
    response.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HH-UPDATER</title>
        </head>
        <body>
          ${body}
        </body>
      </html>
    `);
  })
  .listen(process.env?.PORT);
