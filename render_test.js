const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

require("dotenv").config();

const scrapeLogic = async (res) => {
  const baseUrl = "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";

  puppeteer.launch({
    headless: true, // Defina como false para depuração visual
    args: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--disable-web-security', // Desativa a segurança da web para evitar problemas de CORS, se necessário
      '--disable-features=IsolateOrigins,site-per-process' // Pode ajudar com problemas de isolamento de sites
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  }).then(async browser => {
    try {
      const page = await browser.newPage();

      // Definindo um user-agent realista
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

      // Navega para a URL
      await page.goto(baseUrl, { waitUntil: "networkidle2" }); // Espera até que a rede esteja praticamente ociosa

      // Espera especificamente por algum elemento da página para garantir que o conteúdo foi carregado
      // await page.waitForSelector('seletor-do-elemento', { timeout: 10000 }); // Ajuste conforme necessário

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
