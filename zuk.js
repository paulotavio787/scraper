const puppeteer = require("puppeteer");
require("dotenv").config();

async function setupBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    executablePath: process.env.NODE_ENV === "production"
      ? process.env.PUPPETEER_EXECUTABLE_PATH
      : puppeteer.executablePath(),
  });
  return browser;
}

async function scrapePage(browser, url) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
  
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    // A opção de desabilitar o JavaScript é comentada, descomente se o site permitir a raspagem sem executar JavaScript
    // await page.setJavaScriptEnabled(false);

    const items = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.card-property')).map(card => {
        const itemUrl = card.querySelector('.card-property-image-wrapper a') ? card.querySelector('.card-property-image-wrapper a').href : 'No URL';
        const imageUrl = card.querySelector('.card-property-image-wrapper img') ? card.querySelector('.card-property-image-wrapper img').src : 'No Image URL';
        const description = card.querySelector('.card-property-proposta-open') ? card.querySelector('.card-property-proposta-open').innerText.trim() : 'No Description';
        const address = card.querySelector('.card-property-address span') ? card.querySelector('.card-property-address span').innerText.trim() : 'No Address';
        const area = card.querySelector('.card-property-info-label') ? card.querySelector('.card-property-info-label').innerText.trim() : 'No Area';
        const value = card.querySelector('.card-property-price-value') ? card.querySelector('.card-property-price-value').innerText.trim() : 'No Value';
      
        return { itemUrl, imageUrl, description, address, area, value };
      });
    });

    await page.close();
    return items;
  } catch (e) {
    console.error(`Error loading page: ${e.message}`);
    await page.close();
    return [];
  }
}

async function getTotalItems(browser, baseUrl) {
  const page = await browser.newPage();
  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    const totalItems = await page.evaluate(() => {
      const element = document.querySelector('.list-header-opportunities strong');
      return element ? parseInt(element.innerText.replace(/\D/g, ''), 10) : 0;
    });
    await page.close();
    return totalItems;
  } catch (error) {
    console.error(`Error fetching total items: ${error}`);
    await page.close();
    return 0; // Fallback to 0 if there's an error
  }
}

async function scrapeAllItems(baseUrl, itemsPerPage = 30) {
  const browser = await setupBrowser();
  try {
    const totalItems = await getTotalItems(browser, baseUrl);
    const numPages = Math.ceil(totalItems / itemsPerPage);
    let allItems = [];

    for (let i = 0; i < numPages; i++) {
      const start = i * itemsPerPage;
      const url = `${baseUrl}?start=${start}`;
      const items = await scrapePage(browser, url);
      allItems.push(...items);
    }

    return allItems;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeAllItems };
