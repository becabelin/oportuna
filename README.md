# Oportuna

API com uma **base de oportunidades de estudo** (bolsas, eventos, cursos, estágios, intercâmbios e concursos).

Quem implementa o app **só consulta**. A coleta a partir de sites e RSS é nossa: roda em segundo plano e grava em `data/base.json`. O consumidor chama `GET /api/oportunidades` e recebe o acervo.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://127.0.0.1:3847](http://127.0.0.1:3847). Documentação em `/docs`. JSON em `/api/oportunidades`.

## Puxar a base

```bash
# Inscrições ainda abertas (o que a maioria dos apps quer)
curl "http://127.0.0.1:3847/api/oportunidades?status=abertas&limit=todas"

# Tudo o que está na base
curl "http://127.0.0.1:3847/api/oportunidades?status=todas&limit=todas"

# Um item
curl "http://127.0.0.1:3847/api/oportunidades/pibic-cnpq-2026"
```

Resposta: `{ "data": [ ...oportunidades ], "meta": { "total", "page", "limit", "totalPages" } }`.

Filtros opcionais: `q`, `tipo`, `area`, `nivel`, `modalidade`, `pais`, `status`, `ordenar`, `page`, `limit`.

## Como a base é atualizada

Fontes oficiais (RSS e páginas de editais) ficam no código / em `data/base.json`. A cada 30 minutos o servidor busca de novo e mantém o que ainda está aberto. Isso **não** é parte da API pública — quem consome não envia links.

Em host serverless (Vercel), configure um cron para `GET /api/coletar`. Em Railway/Render o loop interno basta.

## Repositório

```bash
git clone https://origin.cursor.com/rebeca-sousa/tmp-510dcabb2e0718f5.git oportuna
cd oportuna
npm install
npm run dev
```

## Publicar

O jeito mais simples é a **Vercel** (Next.js nativo). Há um cron em `vercel.json` que chama `GET /api/coletar` a cada hora.

```bash
npx vercel --yes
```

Em Railway, Render ou qualquer VPS:

```bash
docker build -t oportuna .
docker run -p 3000:3000 oportuna
```

O `npm start` respeita a variável `PORT`. Em disco gravável, `data/base.json` persiste entre reinícios; na Vercel o arquivo versionado no Git é a base, e a coleta em runtime não sobrevive.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui. Cheerio na coleta interna.
