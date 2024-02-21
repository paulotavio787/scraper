const app = require("express")();
// const { scrapeDynamicContent } = require('./globo_leiloes'); 

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-images",
      ],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
      timeout: 60000,
    };
  }

  const categorias = [...new Set([
    "Terreno", "Lote", "Vaga de Garagem", "Casa", "Sobrado",
    "Apartamento", "Cobertura", "Fazenda", "Gleba",
    "Chácara", "Sítio", "Sala", "Escritório", "Galpão"
  ])];
  const baseUrl = "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";
  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    await page.goto("https://www.google.com");
    res.send(await page.title());
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
