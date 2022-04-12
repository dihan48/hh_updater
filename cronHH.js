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

export async function send(errorWait) {
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

  let nextWait = errorWait;
  let response = null;

  try {
    response = await fetch(
      "https://spb.hh.ru/applicant/resumes/touch",
      options
    );

    if (response) {
      switch (response.status) {
        case 409:
          status.explanation = "Premature attempt";
          break;
        case 403:
          status.explanation = "Possibly anti-ddos";
          break;
        case 200:
          status.explanation = "Updated";
          nextWait = await getWait();
          break;

        default:
          status.explanation = "Unexpected error";
          break;
      }

      status.code = response.status;
      status.error = await response.text();
    }
  } catch (error) {
    console.error(error);
    status.code = e;
    status.error = e.toString();
  }

  status["last run send"] = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });

  return nextWait;
}

await loop();

export async function loop() {
  timeout && clearTimeout(timeout);

  const data = await tryGetData();
  logHHdata(data);

  if (data) {
    const wait = data.updated + data.updateTimeout - new Date().getTime();

    if (wait < 0) {
      timer = await send(300000);
    } else {
      timer = wait;
    }
  } else {
    timer = await send(1800000);
  }

  timeout = setTimeout(async () => {
    await loop();
  }, timer);

  status["next run script"] = new Date(
    new Date().getTime() + timer
  ).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
}

async function getWait() {
  const data = await tryGetData();
  logHHdata(data);

  if (data) {
    const wait = data.updated + data.updateTimeout - new Date().getTime();

    return wait > 0 ? wait : 300000;
  } else {
    return 14400000;
  }
}

function logHHdata(data) {
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
}
