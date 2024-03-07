const app = require("express")();
const puppeteer = require("puppeteer");
// const { scrapeDynamicContent } = require("./globo_leiloes");
const { scrapeLogic } = require("./render_test");
const {scrapeAllItems} = require("./zuk.js")

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
    const baseUrl = "https://www.portalzuk.com.br/leilao-de-imoveis";
    const allItems = await scrapeAllItems(baseUrl);
    res.json(allItems)
    console.log(allItems.length);
  } catch (err) {
    console.error(err);
    return null;
  }
});

// app.get("/test", async (req, res) => {
//     try {
//         scrapeLogic(res);
//     } catch (err) {
//       console.error(err);
//       return null;
//     }
//   });

app.listen(process.env.PORT || 4000, () => {
  console.log("Server started");
});

module.exports = app;
