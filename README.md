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

## Stack

Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui. Não há banco nem autenticação neste recorte.
