const fs = require("fs");
const http = require('http');
const puppeteer = require('puppeteer');

const webFolder = 'www';
const screenshotName = 'screenshot.png';
const buttonSelector = `*[data-qa="resume-update-button"]`;
const headers = {
    'connection': 'keep-alive',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Yandex";v="90"',
    'sec-ch-ua-mobile': '?0',
    'dnt': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 YaBrowser/21.5.1.330 Yowser/2.5 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ru,en;q=0.9'
};

let hhtoken = null;
let resumeUrl = null;
let loopTimeout = null;

http.createServer(function (request, response) {
    const url = new URL(`http://127.0.0.1:${this.address().port}${request.url}`);
    const params = url.searchParams;
    const path = url.pathname !== "/" ? url.pathname : "/index.html"

    if (path === "/api") {
        const res = apiHandler(params);
        response.end(JSON.stringify(res));
    } else {
        fs.readFile(`./${webFolder}${path}`, function (error, data) {
            if (error) {
                response.statusCode = 404;
                response.end("Resourse not found!");
            } else {
                response.end(data);
            }
        });
    }
}).listen(3000);

function apiHandler(params) {
    const res = {};
    for (let key of params.keys()) {
        res[key] = apiHandlers[key]?.(params.get(key));
    }
    return res;
}

const apiHandlers = {
    hhtoken: (token) => {
        if(token)
            hhtoken = token;

        return !!token;
    },
    resumeUrl: (url) => {     
        if(url)
            resumeUrl = url;

        return !!url;
    },
    updateResume: () => {
        loop()
        return true;
    }
}

async function go() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-web-security', '--window-size=1920,1080'] });
    const page = await browser.newPage()

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 YaBrowser/21.5.1.330 Yowser/2.5 Safari/537.36");
    await page.setCookie({ name: "hhtoken", value: hhtoken || process.env.HHTOKEN || '', domain: ".hh.ru" });
    await page.setExtraHTTPHeaders(headers);
    await page.setViewport({
        width: 1903,
        height: 964,
        deviceScaleFactor: 1,
    });

    await page.setRequestInterception(true);
    
    try {
        page.on('request', request => request.continue(headers));
    } catch (error) {
        console.error(error);
    }

    const url = resumeUrl || process.env.RESUME_LINK;

    if (url)
        await page.goto(url);
    else
        console.log('нужно задать ссылку на резюме');

    const buttons = await page.$$(buttonSelector);
    for (let i = 0; i < buttons.length; i++) {
        if (await buttons[i].boundingBox()) {
            buttons[i].click();
            break;
        }
    }

    await new Promise(r => setTimeout(() => r(), 2000));
    await page.screenshot({ path: `./${webFolder}/${screenshotName}` });
    await browser.close();
}

function loop() {
    if(loopTimeout){
        clearTimeout(loopTimeout);
    }

    loopTimeout = setTimeout(() => loop(), 4 * 60 * 60 * 1000 + 2 * 60 * 1000);
    go();
}

if(process.env.RESUME_LINK && process.env.HHTOKEN){
    loop();
}