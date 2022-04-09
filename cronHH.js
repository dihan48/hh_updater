import fetch from "node-fetch";
import { FormData } from "formdata-node";
import { tryGetData } from "./hhData.js";
import { HHTOKEN, RESUMEHASH } from "./consts.js";

let timer = null;
let timeout = null;

const status = {};

export function getStatus() {
  return status;
}

const formData = new FormData();
formData.append("resume", RESUMEHASH);
formData.append("undirectable", "true");

export function send() {
  const options = {
    headers: {
      accept: "application/json",
      cookie: `hhtoken=${HHTOKEN}; _xsrf=autoupdatefromdihan`,
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
      status["last run send"] = new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      });
    });
}

await loop();

export async function loop() {
  let result = false;
  const data = await tryGetData();

  if (data) {
    timer = data.updated + data.updateTimeout - new Date().getTime();
    timeout && clearTimeout(timeout);
    timeout = setTimeout(async () => {
      await loop();
    }, timer);
  } else {
    timer = status?.code === 200 ? 14460000 : 1800000;
    result = true;
    send();

    timeout && clearTimeout(timeout);
    timeout = setTimeout(async () => {
      await loop();
    }, timer);
  }

  status["last update (hh)"] = data?.updated
    ? new Date(data.updated).toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      })
    : undefined;

  status["next update (hh)"] =
    data?.updated && data?.updateTimeout
      ? new Date(data.updated + data.updateTimeout).toLocaleString("ru-RU", {
          timeZone: "Europe/Moscow",
        })
      : undefined;

  status["next run script"] = new Date(
    new Date().getTime() + timer
  ).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
  return result;
}
