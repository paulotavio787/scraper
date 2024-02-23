const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

require("dotenv").config();

const scrapeLogic = async (res) => {
  const baseUrl = "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";

  puppeteer.launch({
    headless: false,
    args: ['--disable-setuid-sandbox', '--no-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  }).then(async browser => {
    try {
      const page = await browser.newPage();

      // Navega para a URL
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForFunction(
        'document.title != "Just a moment..."',
        { timeout: 10000 }
      );

      // Captura o título da página para verificar se o scraping foi bem-sucedido
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
