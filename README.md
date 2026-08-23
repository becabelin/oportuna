# Oportuna

API com uma **base de oportunidades de estudo** (bolsas, eventos, cursos, estágios, intercâmbios e concursos).

Quem implementa o app **só consulta**. A coleta a partir de sites e RSS é nossa: roda em segundo plano e grava em `data/base.json`. O consumidor chama `GET /api/oportunidades` e recebe o acervo.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://127.0.0.1:3847](http://127.0.0.1:3847). Peça uma chave em `/chave`. Documentação em `/docs`.

## Puxar a base (com chave)

```bash
# 1. Peça uma chave em http://127.0.0.1:3847/chave  (ou POST /api/chaves)

# 2. Inscrições ainda abertas
curl -H "Authorization: Bearer opt_SUA_CHAVE" \
  "http://127.0.0.1:3847/api/oportunidades?status=abertas&limit=todas"
```

O mural no site **não** pede chave. Só a API. Cada chave tem teto de 120 chamadas/minuto e 5 mil/dia — para um script não queimar o plano da Vercel.

**Custo:** a chave não é cobrança. Cada GET gasta um pouco de função + banda. No Hobby da Vercel isso é grátis até um volume alto (centenas de milhares de chamadas/mês, não um app de faculdade). Se um dia crescer de verdade, aperta o teto ou sobe o plano — não existe “R$ por bolsa”.

Na Vercel o arquivo `data/chaves.json` não sobrevive entre deploys; em disco local, sim. Para produção estável depois entra um KV.

Resposta: `{ "data": [ ...oportunidades ], "meta": { "total", "page", "limit", "totalPages" } }`.

Filtros opcionais: `q`, `tipo`, `area`, `nivel`, `modalidade`, `pais`, `status`, `ordenar`, `page`, `limit`.

## Como a base é atualizada

Fontes oficiais (RSS e páginas de editais) ficam no código / em `data/base.json`. A cada 30 minutos o servidor busca de novo e mantém o que ainda está aberto. Isso **não** é parte da API pública — quem consome não envia links.

Em host serverless (Vercel), configure um cron para `GET /api/coletar`. Em Railway/Render o loop interno basta.

## Repositório

```bash
git clone https://github.com/becabelin/oportuna.git
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

Em produção, defina `NEXT_PUBLIC_SITE_URL` com o domínio canônico (ex.: `https://oportuna.vercel.app`). Sem isso, sitemap, JSON-LD, Open Graph e `/llms.txt` caem no fallback local `http://127.0.0.1:3847`.

## SEO e GEO

O mural da home é HTML de servidor: buscadores e modelos leem títulos e subtítulos sem executar o app. Cada oportunidade tem URL própria, dados estruturados (JSON-LD), imagem Open Graph e prazo em `<time>`.

Rotas para indexação e citação:

- `/sitemap.xml` — mural, páginas estáticas e cada edital
- `/robots.txt` — libera o mural e bots de IA; bloqueia `/fontes`, `/cadastrar` e `/api/`
- `/llms.txt` — resumo para modelos (também em `/.well-known/llms.txt`)
- `/llms-full.txt` — inventário das inscrições abertas
- `/feed.xml` — RSS das abertas
- `/sobre` — o que é a base e como citar sem inventar prazo

## Stack

Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui. Cheerio na coleta interna.
