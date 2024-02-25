const app = require("express")();
const puppeteer = require("puppeteer");
const { scrapeDynamicContent } = require("./globo_leiloes");
const { scrapeLogic } = require("./render_test");

// app.get("/", async (req, res) => {
//   const categorias = [
//     ...new Set([
//       "Terreno",
//       "Lote",
//       "Vaga de Garagem",
//       "Casa",
//       "Sobrado",
//       "Apartamento",
//       "Cobertura",
//       "Fazenda",
//       "Gleba",
//       "Chácara",
//       "Sítio",
//       "Sala",
//       "Escritório",
//       "Galpão",
//     ]),
//   ];
//   const baseUrl =
//     "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";

//   try {
//     console.time("ScrapingExecutionTime");

//     const result = await scrapeDynamicContent(baseUrl, categorias);
//     console.log(result[0]);
//     res.status(200).json(result);
//     console.timeEnd("ScrapingExecutionTime");
//   } catch (err) {
//     console.error(err);
//     return null;
//   }
// });

app.get("/google", async (req, res) => {
  try {
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
        // "--single-process",
        // "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    let page = await browser.newPage();
    await page.goto("https://www.portalzuk.com.br/");
    res.send(await page.title());
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.get("/test", async (req, res) => {
    try {
        scrapeLogic(res);
    } catch (err) {
      console.error(err);
      return null;
    }
  });

app.listen(process.env.PORT || 4000, () => {
  console.log("Server started");
});

module.exports = app;
