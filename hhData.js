import fetch from "node-fetch";
import { HHTOKEN, RESUMEHASH } from "./consts.js";

export function tryGetBuildVersion() {
  return new Promise((resolve, reject) => {
    fetch("https://spb.hh.ru", {
      body: null,
      method: "GET",
    })
      .then((res) => res.text())
      .catch(() => {})
      .then((text) => {
        if (text) {
          const buildText = text.indexOf("build");
          const start = text.indexOf('"', buildText) + 1;
          const end = text.indexOf('"', start);
          resolve(text.substring(start, end));
        }
      })
      .catch(() => {})
      .finally(() => resolve());
  });
}

export async function tryGetData() {
  const buildVersion = await tryGetBuildVersion();
  if (buildVersion == null) return undefined;

  let res = null;
  let data = null;

  try {
    res = await fetch(`https://spb.hh.ru/resume/${RESUMEHASH}`, {
      headers: {
        accept: "application/json",
        "x-hhtmfrom": "resume_list",
        "x-hhtmsource": "",
        "x-requested-with": "XMLHttpRequest",
        "x-static-version": buildVersion,
        "x-xsrftoken": "autoupdatefromdihan",
        cookie: `hhtoken=${HHTOKEN}; regions=2; redirect_host=spb.hh.ru; region_clarified=spb.hh.ru; _xsrf=autoupdatefromdihan; hhrole=applicant; display=desktop`,
        Referer:
          "https://spb.hh.ru/applicant/resumes?hhtmFrom=main&hhtmFromLabel=header",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });
  } catch (error) {
    console.error(error);
    return undefined;
  }

  if (res.json) {
    try {
      data = await res.json();
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  const updated = data?.resume?.updated;
  const updateTimeout = data?.resume?.updateTimeout;

  return updated && updateTimeout
    ? {
        updated: data?.resume?.updated,
        updateTimeout: data?.resume?.updateTimeout,
      }
    : undefined;
}
