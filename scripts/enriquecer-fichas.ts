import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { enriquecerFichasPendentes } from "../src/lib/enriquecer-ficha";

function carregarEnvLocal() {
  try {
    const texto = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const linha of texto.split("\n")) {
      const trimmed = linha.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const chave = trimmed.slice(0, eq).trim();
      let valor = trimmed.slice(eq + 1).trim();
      if (
        (valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))
      ) {
        valor = valor.slice(1, -1);
      }
      if (!process.env[chave]) process.env[chave] = valor;
    }
  } catch {
    // sem .env.local neste diretório
  }
}

carregarEnvLocal();

async function main() {
  const limit = Number(process.argv[2] ?? "40");
  const result = await enriquecerFichasPendentes({
    limit: Number.isFinite(limit) ? limit : 40,
  });
  console.log(
    `fichas lidas: ${result.escritas}/${result.total}` +
      (result.erros.length > 0 ? ` · ${result.erros.length} erros` : "")
  );
  for (const erro of result.erros.slice(0, 8)) {
    console.warn(`- ${erro.id}: ${erro.erro}`);
  }
}

void main();
