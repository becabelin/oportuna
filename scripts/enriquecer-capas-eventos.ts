import { enriquecerCapasEventos } from "../src/lib/coleta";

async function main() {
  const result = await enriquecerCapasEventos();
  console.log(`eventos: ${result.comCapa}/${result.total} com capa da fonte`);
}

void main();

