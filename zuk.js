const puppeteer = require("puppeteer");
require("dotenv").config();

let browser;
let page;

async function setupBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath:
    process.env.NODE_ENV === "production"
      ? process.env.PUPPETEER_EXECUTABLE_PATH
      : puppeteer.executablePath(),
  });
  page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
}

async function getTotalItems(baseUrl) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  const totalItems = await page.evaluate(() => {
    const element = document.querySelector('.list-header-opportunities strong');
    return element ? parseInt(element.innerText.replace(/\D/g, ''), 10) : 0;
  });
  return totalItems;
}

async function scrapePage(url, retryCount = 0) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const items = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.card-property')).map(card => {
          const url = card.querySelector('.card-property-image-wrapper a') ? card.querySelector('.card-property-image-wrapper a').href : 'No URL';
          const imageUrl = card.querySelector('.card-property-image-wrapper img') ? card.querySelector('.card-property-image-wrapper img').src : 'No Image URL';
          const description = card.querySelector('.card-property-proposta-open') ? card.querySelector('.card-property-proposta-open').innerText.trim() : 'No Description';
          const address = card.querySelector('.card-property-address span') ? card.querySelector('.card-property-address span').innerText.trim() : 'No Address';
          const area = card.querySelector('.card-property-info-label') ? card.querySelector('.card-property-info-label').innerText.trim() : 'No Area';
          const value = card.querySelector('.card-property-price-value') ? card.querySelector('.card-property-price-value').innerText.trim() : 'No Value';
      
          return { url, imageUrl, description, address, area, value };
        });
      });
    
    return items;
  } catch (e) {
    console.error(`Error loading page: ${e.message}. Retry ${retryCount}`);
    if (retryCount < 3) {
      await page.waitForTimeout(5000);
      return scrapePage(url, retryCount + 1);
    } else {
      console.error(`Failed to load page after retries: ${url}`);
      return [];
    }
  }
}

async function scrapeAllItems(baseUrl, itemsPerPage = 30) {
  await setupBrowser();

  const totalItems = await getTotalItems(baseUrl);
  const numPages = Math.ceil(totalItems / itemsPerPage);
  const allItems = [];

  for (let i = 0; i < numPages; i++) {
    const start = i * itemsPerPage;
    const url = `${baseUrl}?start=${start}`;
    const items = await scrapePage(url);
    allItems.push(...items);
  }

  await page.close();
  await browser.close();
  return allItems;
}

const baseUrl = "https://www.portalzuk.com.br/leilao-de-imoveis";

// (async () => {
//   try {
//     const allItems = await scrapeAllItems(baseUrl);
//     console.log(allItems);
//     // Aqui, você pode processar os itens raspados conforme necessário
//   } catch (error) {
//     console.error(`Error during scraping: ${error}`);
//   }
// })();

module.exports = {scrapeAllItems}