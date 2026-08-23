export const FAQ = [
  {
    q: "O que é a Oportuna?",
    a: "A Oportuna é um mural público de bolsas de estudo, eventos, cursos, estágios, intercâmbios e concursos. Junta editais abertos num só lugar, com link para a inscrição oficial.",
  },
  {
    q: "Preciso pagar ou criar conta para consultar?",
    a: "Não. O mural no site é gratuito e sem cadastro. Só pede chave quem vai puxar a base por API, no próprio aplicativo.",
  },
  {
    q: "De onde vêm as oportunidades?",
    a: "De páginas e feeds oficiais que a Oportuna acompanha. Cada item passa por um filtro para não misturar artigo de blog com edital. O prazo e as regras valem no site da organização, não aqui.",
  },
  {
    q: "Como um app consulta a base?",
    a: "Peça uma chave em /chave e chame GET /api/oportunidades com Authorization: Bearer. A documentação está em /docs. O mural HTML continua aberto para pessoas e para mecanismos de busca.",
  },
] as const;
