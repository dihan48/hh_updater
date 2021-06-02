const puppeteer = require('puppeteer');
const http = require('http');
const fs = require("fs");
  
http.createServer(function(request, response){
      
    console.log(`Запрошенный адрес: ${request.url}`);
    // получаем путь после слеша
    const filePath = request.url.substr(1);
    fs.readFile(filePath, function(error, data){
        if(error){
                  
            response.statusCode = 404;
            response.end("Resourse not found!");
        }   
        else{
            response.end(data);
        }
    });
}).listen(3000, function(){
    console.log("Server started at 3000");
});

async function go() {
    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_BIN || null,
        args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-web-security'],
    });
    const page = await browser.newPage()
    await page.setCookie({ name: "hhtoken", value: process.env.HHTOKEN, domain: ".hh.ru" });
    await page.setViewport({
        width: 1920,
        height: 964,
        deviceScaleFactor: 1,
    });

    await page.setExtraHTTPHeaders({
        connection: 'keep-alive',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Yandex";v="90"',
        'sec-ch-ua-mobile': '?0',
        dnt: '1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 YaBrowser/21.5.1.330 Yowser/2.5 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        purpose: 'prefetch',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'ru,en;q=0.9'
    });
    await page.mouse.move( 312, 619, 56 );
    await page.goto('https://hh.ru/applicant/resumes');
    await page.mouse.move( 820, 316, 51 );
    await new Promise(r => setTimeout(() => r(), 1240));
    await page.mouse.wheel({ deltaY: 100 });
    await new Promise(r => setTimeout(() => r(), 174));
    await page.mouse.wheel({ deltaY: 100 });
    await new Promise(r => setTimeout(() => r(), 66));
    await page.mouse.wheel({ deltaY: 100 });
    await new Promise(r => setTimeout(() => r(), 87));
    await page.mouse.wheel({ deltaY: 100 });
    await new Promise(r => setTimeout(() => r(), 32));
    await page.mouse.wheel({ deltaY: 100 });
    await new Promise(r => setTimeout(() => r(), 91));
    await new Promise(r => setTimeout(() => r(), 1635));
    const elem = await page.waitForSelector(`div[data-qa-id="${process.env.QAID}"] button[data-qa="resume-update-button"]`);
    const boundingBox = await elem.boundingBox();

    await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2,
        113
    );

    await new Promise(r => setTimeout(() => r(), 162));
    await page.mouse.click(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
    );
    await page.screenshot({ path: 'screenshot.png' });
    await new Promise(r => setTimeout(() => r(), 2000));
    await browser.close();
}

go();

setInterval(() => {
    go()
}, 4*60*60*1000);