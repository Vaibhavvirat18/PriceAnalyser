const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

//////////////////////////////////////////////////////////////////////////////////////////////////////

let page;
let html;
let productToBeSearched = "iphone-12";
let amazonURL = "https://www.amazon.in/";
let flipkartURL = "https://www.flipkart.com/";
let paytmURL = "https://paytmmall.com/";


(async function () {
    let browserContext;
    try {
        browserContext = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        const newPage = await browserContext.newPage();
        page = newPage;

        //AMAZON

        await page.goto(amazonURL);
        await waitAndClick("#twotabsearchtextbox");
        await page.type("#twotabsearchtextbox", productToBeSearched);
        await page.click("#nav-search-submit-button");
        await page.waitForSelector('.sg-row img[data-image-index="1"]');

        html= await page.content();
        let $= cheerio.load(html);
        let arr= $('.a-link-normal.s-no-outline');
        let url= amazonURL+ $(arr[0]).attr("href");
        await page.goto(url);

        html= await page.content();
        $= cheerio.load(html);

        fs.openSync("priceAnalyser.pdf", "w");

        let amazonScrape= 'Amazon'+'\n';
        amazonScrape+= "Product Available:-" + $('#productTitle').text().trim()+ '\n';
        amazonScrape+= "Price:-Rs." + $($('.a-box-inner .a-price-whole')[0]).text().trim()+ '\n';
        amazonScrape+= "Description"+'\n';


        let description= $('.a-unordered-list.a-vertical.a-spacing-mini .a-list-item');
        for(let i=0; i< description.length; i++){
           amazonScrape+=$(description[i]).text()+'\n';
        }

        amazonScrape+= '\n';

        fs.appendFileSync("priceAnalyser.pdf", amazonScrape);



        //FLIPKART

        await page.goto(flipkartURL,{ waitUntil: 'networkidle0'});
        await page.click('._2KpZ6l._2doB4z');

        await waitAndClick('input[title="Search for products, brands and more"]');
        await page.type('input[title="Search for products, brands and more"]', productToBeSearched);
        await page.click('button[type="submit"]');
        
        await page.waitFor(5000);

        html= await page.content();
        $= cheerio.load(html);

        arr= $('a[rel="noopener noreferrer"]');
        url= "https://www.flipkart.com"+ $(arr[0]).attr("href");

        await page.goto(url,{ waitUntil: 'networkidle0'});

        html= await page.content();
        $= cheerio.load(html);

        let flipkartScrape= 'Flipkart'+'\n';

        flipkartScrape+= "Product Available:-" + $('.B_NuCI').text().trim()+ '\n';
        flipkartScrape+= "Price:-" + $($('._30jeq3._16Jk6d')[0]).text().trim()+ '\n';
        flipkartScrape+= "Description"+'\n';


        description= $('._2418kt li');
        for(let i=0; i< description.length; i++){
            flipkartScrape+=$(description[i]).text()+'\n';
        }

        flipkartScrape+= '\n';

        fs.appendFileSync("priceAnalyser.pdf", flipkartScrape);


        //PAYTM-MALL
        await page.goto(paytmURL,
        {
            waitUntil: 'networkidle0',
            timeout: 0
        });

        await waitAndClick('input[type="search"]');
        await page.type('input[type="search"]', productToBeSearched);
        await page.keyboard.press('Enter');

        await page.waitFor(5000);

        html = await page.content();
        $ = cheerio.load(html);

        arr = $('._2i1r ._3WhJ');
        url = "https://paytmmall.com/" + $(arr[0]).find('a').attr("href");

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });

        html = await page.content();
        $ = cheerio.load(html);

        let paytmScrape= 'PaytmMall'+'\n';

        paytmScrape+= "Product Available:-" + $('h1.NZJI').text().trim()+ '\n';
        paytmScrape+= "Price:-Rs." + $('._2LVL ._1V3w').text().trim()+ '\n';
        paytmScrape+= "Description"+'\n';
        paytmScrape+= "N/A"+'\n';

        fs.appendFileSync("priceAnalyser.pdf", paytmScrape);

    } catch (error) {
        console.log(error);
    }
    finally {
        await browserContext.close();
    }

})();

async function waitAndClick(selector) {
    await page.waitForSelector(selector);
    await page.click(selector);
}

