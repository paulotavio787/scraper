const app = require("express")();
const { scrapeDynamicContent } = require('./globo_leiloes'); 

app.get("/", async (req, res) => {

  const categorias = [...new Set([
    "Terreno", "Lote", "Vaga de Garagem", "Casa", "Sobrado",
    "Apartamento", "Cobertura", "Fazenda", "Gleba",
    "Chácara", "Sítio", "Sala", "Escritório", "Galpão"
  ])];
  const baseUrl = "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";
  
  try {
    console.time("ScrapingExecutionTime");

    const result = await scrapeDynamicContent(baseUrl, categorias);
    res.status(200).json(result)

    // const browser = await puppeteer.launch({
    //     args: [
    //       "--disable-setuid-sandbox",
    //       "--no-sandbox",
    //       "--single-process",
    //       "--no-zygote",
    //     ],
    //     executablePath:
    //       process.env.NODE_ENV === "production"
    //         ? process.env.PUPPETEER_EXECUTABLE_PATH
    //         : puppeteer.executablePath(),
    //   });
    // let page = await browser.newPage();
    // await page.goto("https://www.google.com");
    // res.send(await page.title());
    console.timeEnd("ScrapingExecutionTime");

  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
