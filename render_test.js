const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

require("dotenv").config();

const scrapeLogic = async (res) => {
  const baseUrl = "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";

  puppeteer.launch({
    headless: true,
    args: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
      
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  }).then(async browser => {
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

      await page.goto(baseUrl, { waitUntil: "networkidle2" });

      // Estratégia de Espera Aumentada
      await page.waitForTimeout(10000); // Espera adicional para permitir que a página carregue completamente

      // Estratégia de Detecção de Mudança
      await page.waitForFunction(
        'document.title != "Just a moment..."',
        { timeout: 30000 }
      );

      const title = await page.title();
      const results = [{ title: title }];

      console.log(results);
      res.status(200).json(results);
    } catch (e) {
      console.error(e);
      res.status(500).send(`Something went wrong while running Puppeteer: ${e}`);
    } finally {
      await browser.close();
    }
  });
};

module.exports = { scrapeLogic };
