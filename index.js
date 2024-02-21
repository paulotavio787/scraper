const { scrapeDynamicContent } = require('./globo_leiloes');

async function main() {
  console.log("Iniciando scraping...");

  // Defina a URL base e categorias para o scraper de leilões da Globo
  const baseUrl = "https://globoleiloes.com.br/leiloes/residenciais/todos-os-residenciais/todos-os-estados/todas-as-cidades/";
  const categorias = [...new Set([
    "Terreno", "Lote", "Vaga de Garagem", "Casa", "Sobrado",
    "Apartamento", "Cobertura", "Fazenda", "Gleba",
    "Chácara", "Sítio", "Sala", "Escritório", "Galpão"
  ])];

  // Executar o scraper de leilões da Globo
  try {
    const results = await scrapeDynamicContent(baseUrl, categorias);
    console.log(`Scraping concluído. Total de itens raspados: ${results.length}`);
    // Faça algo com os resultados, como salvar em um banco de dados
  } catch (error) {
    console.error("Erro durante o scraping:", error);
  }

  // Aqui você pode adicionar chamadas para outros scrapers seguindo a mesma estrutura
}

main().then(() => console.log("Todos os scrapings foram concluídos."));