# Oportuna

Você **cola um link** de site, RSS ou página de editais. A Oportuna coleta bolsas, eventos e outros editais que ainda parecem **abertos**, e atualiza de novo a cada 30 minutos.

Há também um catálogo inicial (CNPq, CAPES, Chevening, etc.) para o app não nascer vazio. Tudo fica em memória neste processo: reiniciar o servidor volta às fontes e ao catálogo originais.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://127.0.0.1:3847](http://127.0.0.1:3847). Cole uma URL na home ou em `/fontes`. Documentação em `/docs`; índice JSON em `/api`.

## Fluxo

1. `POST /api/fontes` com `{ "url": "https://..." }` — ou o campo na home.
2. A coleta lê RSS/Atom, JSON-LD e links da página, infere tipo e prazo, e guarda o que ainda está aberto.
3. A cada 30 minutos o servidor busca de novo. Fora isso: botão **Atualizar todas agora** ou `POST /api/coletar`.
4. Em host serverless (Vercel), o intervalo do processo não roda: configure um cron apontando para `/api/coletar`. Em Railway/Render, o loop interno vale enquanto o serviço estiver no ar.

RSS funciona melhor que sites pesados em JavaScript. Páginas do governo às vezes bloqueiam o bot.

## API

| Método | Caminho | Função |
| --- | --- | --- |
| `GET` | `/api` | Índice e resumo |
| `GET` | `/api/fontes` | Fontes monitoradas |
| `POST` | `/api/fontes` | Adiciona URL e coleta |
| `POST` | `/api/fontes/:id/coletar` | Coleta uma fonte |
| `DELETE` | `/api/fontes/:id` | Remove fonte e itens coletados |
| `GET`/`POST` | `/api/coletar` | Atualiza todas as fontes |
| `GET` | `/api/oportunidades` | Lista paginada e filtrada |
| `POST` | `/api/oportunidades` | Cadastro manual de um edital |
| `GET` | `/api/oportunidades/:id` | Detalhe |
| `PATCH` | `/api/oportunidades/:id` | Atualiza |
| `DELETE` | `/api/oportunidades/:id` | Remove |

Filtros da listagem: `q`, `tipo`, `area`, `nivel`, `modalidade`, `pais`, `status` (`abertas` \| `encerradas` \| `todas`), `origem` (`coleta` \| `manual`), `fonteId`, `ordenar`, `page`, `limit`.

```bash
curl -X POST http://127.0.0.1:3847/api/fontes \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.scholars4dev.com/feed/"}'

curl "http://127.0.0.1:3847/api/oportunidades?origem=coleta&status=abertas"
```

## Publicar

Para outras pessoas usarem, hospede o app (Vercel, Railway ou Render) e compartilhe a URL. Detalhes abaixo. Os dados continuam em memória até haver um banco.

### Vercel

1. Repositório no GitHub.
2. [vercel.com](https://vercel.com) → **Add New… → Project**.
3. Cron recomendado: a cada 30 min, `GET https://seu-projeto.vercel.app/api/coletar`.

### Railway ou Render

Processo Node contínuo: o loop de 30 minutos roda sozinho. Build `npm run build`, start `npm run start`.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui. Cheerio na coleta. Sem banco e sem autenticação neste recorte.
