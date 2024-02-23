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
        // "--single-process",
        // "--no-zygote",
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
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const items = await page.title()

    results = [{title: items}];

    // const hasNextPage = await page.evaluate(() => {
    //   const nextPageButton = document.querySelector(
    //     'a[href*="pagina="]:last-of-type'
    //   );
    //   return (
    //     Boolean(nextPageButton) &&
    //     !nextPageButton.classList.contains("disabled")
    //   );
    // });

    //   if (!hasNextPage) break;
    //   currentPage++;
    // }

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
