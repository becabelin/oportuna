export const LIMITES_API = {
  porMinuto: 120,
  porDia: 5_000,
};

/** Teto por IP em toda rota pública, com ou sem chave. Cobre o mural e quem forja Origin. */
export const LIMITES_IP = {
  porMinuto: 180,
  porDia: 8_000,
};

export const LIMITE_PEDIDOS_POR_HORA = 5;

export const LIMITES_PEDIDO_CHAVE = {
  porMinuto: 3,
  porDia: 20,
};

/** Tentativas falhas de senha admin por IP. */
export const LIMITES_ADMIN_LOGIN = {
  porMinuto: 8,
  porDia: 30,
};
