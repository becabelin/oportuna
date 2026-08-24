# Trilha da Oportunidade

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

O mural no site **não** pede chave. Só a API. Cada chave tem teto de 120 chamadas/minuto e 5 mil/dia, para um script não queimar o plano da Vercel.

**Custo:** a chave não é cobrança. Cada GET gasta um pouco de função + banda. No Hobby da Vercel isso é grátis até um volume alto (centenas de milhares de chamadas/mês, não um app de faculdade). Se um dia crescer de verdade, aperta o teto ou sobe o plano. Não existe “R$ por bolsa”.

Na Vercel as chaves e as cotas ficam no Redis (Upstash: `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`). Em disco local, o hash vai para `data/chaves.json`. O texto `opt_…` só aparece na emissão.

Resposta: `{ "data": [ ...oportunidades ], "meta": { "total", "page", "limit", "totalPages" } }`.

Filtros opcionais: `q`, `tipo`, `area`, `nivel`, `modalidade`, `pais`, `status`, `ordenar`, `page`, `limit`.

## Como a base é atualizada

Fontes oficiais (RSS e páginas de editais) ficam no código / em `data/base.json`. A cada 30 minutos o servidor busca de novo e mantém o que ainda está aberto. Isso **não** é parte da API pública: quem consome não envia links.

Em host serverless (Vercel), configure um cron para `GET /api/coletar` e defina `CRON_SECRET` (a Vercel envia `Authorization: Bearer` sozinha). Em Railway/Render o loop interno basta.

## Repositório

```bash
git clone https://github.com/becabelin/trilha-da-oportunidade.git
cd trilha-da-oportunidade
npm install
npm run dev
```

## Publicar

O jeito mais simples é a **Vercel** (Next.js nativo). Há um cron em `vercel.json` que chama `GET /api/coletar` a cada hora.

Em produção defina `TRILHA_ADMIN_SECRET`, `CRON_SECRET` e o par Upstash (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). Sem o Redis, chave e teto morrem quando a instância some. Sem o segredo de admin, ninguém cadastra nem apaga pela API. Sem o de cron, o horário recebe 401.

```bash
npx vercel --yes
```

Em Railway, Render ou qualquer VPS:

```bash
docker build -t trilha-da-oportunidade .
docker run -p 3000:3000 trilha-da-oportunidade
```

O `npm start` respeita a variável `PORT`. Em disco gravável, `data/base.json` persiste entre reinícios; na Vercel o arquivo versionado no Git é a base, e a coleta em runtime não sobrevive.

Em produção, defina `NEXT_PUBLIC_SITE_URL` com o domínio canônico (ex.: `https://trilha-da-oportunidade.vercel.app`). Sem isso, sitemap, JSON-LD, Open Graph e `/llms.txt` caem no fallback local `http://127.0.0.1:3847`.

## Segurança

O mural e `GET /api/oportunidades` são públicos (a API pede chave só para apps de terceiros). Incluir, editar, apagar, listar fontes e disparar coleta exigem `TRILHA_ADMIN_SECRET`. Nas telas `/fontes` e `/cadastrar` o navegador pede a senha; via curl use `Authorization: Bearer`.

A coleta automática na Vercel usa `CRON_SECRET`. Não publique esses valores e não use o mesmo segredo da chave `opt_` da API.

Chaves da API são gravadas só como hash (SHA-256). O `opt_…` aparece uma vez. Dá para revogar em `/fontes`. Login admin tem teto de tentativas por IP. Cotas de API (IP e chave) usam o mesmo Redis quando ele está configurado.

## SEO e GEO

O mural da home é HTML de servidor: buscadores e modelos leem títulos e subtítulos sem executar o app. Cada oportunidade tem URL própria, dados estruturados (JSON-LD), imagem Open Graph e prazo em `<time>`.

A imagem de compartilhamento (`/opengraph-image`, `/twitter-image`, 1200×630) usa a logo oficial em fundo branco. Cada edital tem a sua.

Em produção, defina `NEXT_PUBLIC_SITE_URL` (veja `.env.example`) para canonical, sitemap, Open Graph e JSON-LD apontarem para o domínio certo.

Rotas para indexação e citação:

- `/sitemap.xml`: mural, páginas estáticas e editais (abertas com prioridade; encerradas com prioridade baixa)
- `/robots.txt`: libera o mural e bots de IA; bloqueia `/fontes`, `/cadastrar` e `/api/`
- `/llms.txt`: resumo para modelos (também em `/.well-known/llms.txt`)
- `/llms-full.txt`: inventário das inscrições abertas
- `/feed.xml`: RSS das abertas
- `/sobre`: o que é a base e como citar sem inventar prazo

## Acessibilidade

O site busca **WCAG 2.2 AAA**, alinhado ao [Guia WCAG](https://guia-wcag.com/):

- Contraste de texto 7:1 nos modos claro, escuro e alto contraste
- Alvos de clique com no mínimo 44×44 px
- Link “Ir para o conteúdo”
- No cabeçalho: **Claro / Escuro / Contraste**, **A− / A+** e **pausar animações** (vídeo do hero e faixa em movimento)
- Foco visível, `prefers-reduced-motion` e `prefers-contrast`
- Formulários com rótulo, autocomplete e erro associado ao campo
- Várias formas de achar conteúdo: mural, busca, filtros, sitemap e páginas próprias

## Stack

Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui. Cheerio na coleta interna.
