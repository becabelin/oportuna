import assert from "node:assert/strict";
import test from "node:test";

import {
  ehLixoDeColeta,
  ehUrlDeMapa,
  enxugarFicha,
  mesmaOportunidade,
  pareceEndereco,
  pareceNomeDeMarca,
  tituloColetavel,
  tituloForaDoEndereco,
} from "./triagem.ts";

const DESC_DEXCONF =
  "DEXCONF 2026 - Conferência de Design e UX em São Paulo 21 e 22 de Agosto de 2026 a 22 de agosto de 2026 14h às 19h";

const ENDERECO =
  "Avenida da Liberdade, 532, Liberdade, São Paulo - SP, São Paulo, SP, Brasil";

test("endereço de rua não vira título da oportunidade", () => {
  assert.equal(pareceEndereco(ENDERECO), true);
  assert.equal(
    tituloForaDoEndereco(ENDERECO, DESC_DEXCONF),
    "DEXCONF 2026 - Conferência de Design e UX em São Paulo"
  );
  assert.equal(
    tituloColetavel(ENDERECO, DESC_DEXCONF),
    "DEXCONF 2026 - Conferência de Design e UX em São Paulo"
  );
  assert.equal(tituloColetavel(ENDERECO, "Teatro no centro da cidade"), null);
});

test("nome da escola ou marca não vira título da oportunidade", () => {
  assert.equal(pareceNomeDeMarca("Mergo | Escola de Design."), true);
  assert.equal(
    tituloForaDoEndereco("Mergo | Escola de Design.", DESC_DEXCONF),
    "DEXCONF 2026 - Conferência de Design e UX em São Paulo"
  );
  assert.equal(tituloColetavel("Mergo | Escola de Design.", "Sobre a escola"), null);
  assert.equal(pareceNomeDeMarca("DEXCONF 2026: conferência de design e UX"), false);
});

test("link de mapa não entra no mural", () => {
  assert.equal(ehUrlDeMapa("https://maps.google.com/?q=Avenida+da+Liberdade"), true);
  assert.equal(
    tituloColetavel("DEXCONF 2026", DESC_DEXCONF, "https://maps.app.goo.gl/abc"),
    null
  );
  assert.equal(
    ehLixoDeColeta({
      titulo: ENDERECO,
      descricao: "Local do evento",
      url: "https://www.google.com/maps/place/Liberdade",
    }),
    true
  );
});

test("fichas da mesma conferência viram uma só, mesmo com título errado", () => {
  const endereco = { titulo: ENDERECO, descricao: DESC_DEXCONF };
  const marca = { titulo: "Mergo | Escola de Design.", descricao: DESC_DEXCONF };
  const oficial = {
    titulo: "DEXCONF 2026: conferência de design e UX",
    descricao:
      "Encontro da comunidade brasileira de UX, organizado pela Mergo. A edição 2026 acontece no Teatro FECAP.",
  };
  assert.equal(mesmaOportunidade(endereco, marca), true);
  assert.equal(mesmaOportunidade(endereco, oficial), true);
  assert.equal(mesmaOportunidade(marca, oficial), true);
});

test("enxugar ficha troca endereço pelo nome do evento", () => {
  const ficha = enxugarFicha(ENDERECO, DESC_DEXCONF);
  assert.equal(ficha.titulo, "DEXCONF 2026 - Conferência de Design e UX em São Paulo");
  assert.equal(/avenida da liberdade/i.test(ficha.titulo), false);
});

test("conferências diferentes no mesmo ano não se misturam", () => {
  assert.equal(
    mesmaOportunidade(
      {
        titulo: "DEXCONF 2026: conferência de design e UX",
        descricao: "Encontro de UX em São Paulo em 2026.",
      },
      {
        titulo: "UXCONF BR 2026",
        descricao: "Conferência brasileira de UX em 2026.",
      }
    ),
    false
  );
});
