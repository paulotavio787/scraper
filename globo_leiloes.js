const puppeteer = require("puppeteer");
require("dotenv").config();

const categorias = [
  ...new Set([
    "Terreno",
    "Lote",
    "Vaga de Garagem",
    "Casa",
    "Sobrado",
    "Apartamento",
    "Cobertura",
    "Fazenda",
    "Gleba",
    "Chácara",
    "Sítio",
    "Sala",
    "Escritório",
    "Galpão",
  ]),
];

async function scrapeDynamicContent(baseUrl, categorias) {
  const browser = await puppeteer.launch({
    timeout: 60000,
    headless: true, // Garante que está em modo headless
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--disable-images",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (
      req.resourceType() === "stylesheet" ||
      req.resourceType() === "font" ||
      req.resourceType() === "image"
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });
  let currentPage = 1;
  let results = [];

  // while (true) {
  const url = `${baseUrl}?pagina=${currentPage}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  const items = await page.evaluate((categorias) => {
    return Array.from(document.querySelectorAll("div.item")).map((node) => {
      const title = node.querySelector("h3").innerText;
      const auctionType = node.querySelector("h5").innerText;
      const propertyType =
        categorias.find((categoria) => title.includes(categoria)) || "Outro";
      const link = node.querySelector("a").href;
      const pElements = node.querySelectorAll("p");
      const datas = [];
      let lanceMinimo = "";

      pElements.forEach((p) => {
        const text = p.innerText;
        const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
        if (dateMatch) datas.push(dateMatch[0]);

        const lanceMatch = text.match(/R\$ [\d\.,]+/);
        if (lanceMatch && !lanceMinimo) lanceMinimo = lanceMatch[0];
      });

      return { title, auctionType, propertyType, datas, lanceMinimo, link };
    });
  }, categorias);

  results = [...results, ...items];

  const hasNextPage = await page.evaluate(() => {
    const nextPageButton = document.querySelector(
      'a[href*="pagina="]:last-of-type'
    );
    return (
      Boolean(nextPageButton) && !nextPageButton.classList.contains("disabled")
    );
  });

  //   if (!hasNextPage) break;
  //   currentPage++;
  // }

  await browser.close();

  // await processItemsInBatches(results, puppeteer.launch());
  return results;
}

async function processItemsInBatches(results, browserPromise) {
  const concurrentLimit = 20;
  const browser = await browserPromise;

  for (let i = 0; i < results.length; i += concurrentLimit) {
    const batch = results.slice(i, i + concurrentLimit);
    await Promise.all(batch.map((item) => processItemDetail(item, browser)));
  }

  await browser.close();
}

async function processItemDetail(item, browser) {
  const page = await browser.newPage();
  await page.goto(item.link, { waitUntil: "networkidle2" });

  const totalText = await page.evaluate(() => {
    let text = document.body.innerText;
    text = text.toLowerCase();
    text = text.replace(/[^a-z0-9áéíóúñüàè\s]/g, "");
    return text;
  });
  item.totalText = totalText;

  if (item.link.startsWith("https://globoleiloes.com.br")) {
    const localizacao = await page.evaluate(() => {
      const paragrafo = document.querySelector(".row-description p");
      return paragrafo
        ? paragrafo.innerText.split("Localização:")[1].trim()
        : "";
    });
    item.localizacao = localizacao;
  }

  await page.close();
}

const baseUrl =
  "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";
scrapeDynamicContent(baseUrl, categorias)
  .then((data) => console.log(data[0]))
  .catch((error) => console.error("Scraping failed:", error));

module.exports.scrapeDynamicContent = scrapeDynamicContent;
