const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
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
  const baseUrl =
    "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      //   "--single-process",
      //   "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
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
        Boolean(nextPageButton) &&
        !nextPageButton.classList.contains("disabled")
      );
    });
    console.log(results);
    res.status(200).json(results);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
