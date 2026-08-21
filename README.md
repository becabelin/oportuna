# Oportuna

API e catálogo de **oportunidades de estudo**: bolsas, eventos, cursos, estágios, intercâmbios e concursos.

Os dados iniciais são um recorte realista (CNPq, CAPES, Chevening, Campus Party, OBI, etc.). O armazenamento é em memória — útil para explorar a API localmente. Reiniciar o servidor volta o catálogo ao estado original.

## Rodar localmente

```bash
npm install
npm run dev -- --port 3847 --hostname 127.0.0.1
```

Abra [http://127.0.0.1:3847](http://127.0.0.1:3847). A documentação humana da API fica em `/docs`; o índice JSON em `/api`.

## API

| Método | Caminho | Função |
| --- | --- | --- |
| `GET` | `/api` | Índice, enumerações e resumo |
| `GET` | `/api/taxonomia` | Tipos, áreas, níveis, países (com contagem) |
| `GET` | `/api/oportunidades` | Lista paginada e filtrada |
| `POST` | `/api/oportunidades` | Cadastra |
| `GET` | `/api/oportunidades/:id` | Detalhe |
| `PATCH` | `/api/oportunidades/:id` | Atualiza |
| `DELETE` | `/api/oportunidades/:id` | Remove |

Filtros da listagem: `q`, `tipo`, `area`, `nivel`, `modalidade`, `pais`, `status` (`abertas` \| `encerradas` \| `todas`), `ordenar` (`prazo` \| `recentes` \| `titulo`), `page`, `limit`.

CORS está aberto (`Access-Control-Allow-Origin: *`) para consumo a partir de outros apps.

### Exemplos

```bash
curl "http://127.0.0.1:3847/api/oportunidades?tipo=bolsa&status=abertas"

curl -X POST http://127.0.0.1:3847/api/oportunidades \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Bolsa de verão em astronomia",
    "tipo": "bolsa",
    "organizacao": "Observatório Nacional",
    "descricao": "Três meses de iniciação científica em astrofísica observacional.",
    "area": "Ciências Exatas",
    "nivel": "graduacao",
    "modalidade": "presencial",
    "pais": "Brasil",
    "cidade": "Rio de Janeiro",
    "beneficio": "R$ 1.000/mês",
    "prazoInscricao": "2026-10-01",
    "dataInicio": "2027-01-05",
    "dataFim": "2027-03-31",
    "urlInscricao": "https://www.gov.br/observatorio",
    "requisitos": ["Cursando física ou afins"],
    "tags": ["astronomia"],
    "vagas": 12
  }'
```

Erros seguem `{ "error": { "code", "message", "details?" } }`.

## Publicar para outras pessoas

O que roda no seu computador (`127.0.0.1`) só você vê. Para o catálogo e a API ficarem públicos, é preciso hospedar o projeto e compartilhar a URL.

Hoje os dados ficam **em memória**. Quem só consulta bolsas e eventos vê o catálogo inicial. Cadastros novos (`POST` / tela "Cadastrar edital") somem quando o servidor reinicia — e no Vercel, que usa funções serverless, podem nem sobreviver entre um clique e outro. Serve para mostrar a API; para um produto de verdade, o próximo passo é um banco.

### 1. Vercel (o caminho mais curto)

1. Coloque o código num repositório GitHub (ou GitLab / Bitbucket).
2. Entre em [vercel.com](https://vercel.com), faça login e clique em **Add New… → Project**.
3. Importe o repositório. Framework: Next.js. Build: `npm run build`. Sem variáveis de ambiente.
4. Deploy. Você ganha um endereço do tipo `https://oportuna.vercel.app`.

A partir daí, qualquer pessoa usa:

- o site: `https://seu-projeto.vercel.app`
- a API: `https://seu-projeto.vercel.app/api/oportunidades`
- a documentação: `https://seu-projeto.vercel.app/docs`

Pelo CLI, se o GitHub já estiver conectado:

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

No painel da Vercel dá para ligar um domínio próprio (ex.: `oportuna.com.br`).

### 2. Railway ou Render (processo Node contínuo)

Melhor se você quer testar `POST`/`PATCH` por algumas horas no mesmo servidor (ainda em memória, mas sem o “reset” a cada request do serverless).

- **Railway:** New Project → Deploy from GitHub → o `npm run build` + `npm run start` já valem. A plataforma injeta `PORT`.
- **Render:** Web Service → o mesmo repositório → Build `npm install && npm run build` → Start `npm run start`.

### 3. Depois de publicado, como os outros consomem

```bash
curl "https://seu-projeto.vercel.app/api/oportunidades?tipo=bolsa&status=abertas"
```

CORS já está aberto (`Access-Control-Allow-Origin: *`), então outro site ou app mobile pode chamar a API direto.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui. Não há banco nem autenticação neste recorte.
