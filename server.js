import http from "http";
import { FormData } from "formdata-node";
import fetch from "node-fetch";

const hhtoken = getToken();
const resumeHash = getResume();

const status = {};

let interval = null;

const formData = new FormData();
formData.append("resume", resumeHash);
formData.append("undirectable", "true");

http
  .createServer(function (request, response) {
    let body = "";
    if (request.url === "/send") {
      body = `
        <a href="/">Back</a>
        <div>Sended...</div>F
      `;
      send();
    } else {
      body = `
        <a href="/send">Send</a>
        <pre>${JSON.stringify(status, null, 2)}</pre>
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
  .listen(80);

send();

function send() {
  const options = {
    headers: {
      accept: "application/json",
      cookie: `hhtoken=${hhtoken}; _xsrf=autoupdatefromdihan`,
      origin: "https://hh.ru",
      referer: "https://hh.ru/applicant/resumes",
      "x-xsrftoken": "autoupdatefromdihan",
      Connection: "close",
    },
    method: "POST",
    body: formData,
  };

  fetch("https://hh.ru/applicant/resumes/touch", options)
    .then(async (response) => {
      switch (response.status) {
        case 409:
          status.explanation = "Premature attempt";
          break;
        case 403:
          status.explanation = "Possibly anti-ddos";
          break;
        case 200:
          status.explanation = "Updated";
          break;

        default:
          status.explanation = "Unexpected error";
          break;
      }

      status.code = response.status;
      status.error = await response.text();
    })
    .catch((e) => {
      status.code = e;
      status.error = e.toString();
    })
    .finally(() => {
      status["last update"] = new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      });

      let timeout = 1800000;
      if (status?.code == 200) {
        timeout = 14460000;
      }

      status["next update"] = new Date(Date.now() + timeout).toLocaleString(
        "ru-RU",
        {
          timeZone: "Europe/Moscow",
        }
      );

      interval && clearInterval(interval);
      interval = setInterval(() => {
        send();
      }, timeout);
    });
}

function getResume() {
  return process.env?.RESUMEHASH || console.log("need to set a resume hash");
}

function getToken() {
  return process.env?.HHTOKEN || console.log("need to set a hhtoken");
}
