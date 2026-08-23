import type { NextRequest } from "next/server";

import { gatePublicApi } from "@/lib/api-auth";
import { json, optionsResponse } from "@/lib/http";
import { taxonomia } from "@/lib/store";
import { MODALIDADE_LABEL, NIVEL_LABEL, TIPO_LABEL } from "@/lib/taxonomia";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET(request: NextRequest) {
  const gate = gatePublicApi(request);
  if (gate instanceof Response) return gate;
  const data = taxonomia();
  return json(
    {
      data: {
        ...data,
        tipos: data.tipos.map((item) => ({
          ...item,
          label: TIPO_LABEL[item.id],
        })),
        niveis: data.niveis.map((item) => ({
          ...item,
          label: NIVEL_LABEL[item.id],
        })),
        modalidades: data.modalidades.map((item) => ({
          ...item,
          label: MODALIDADE_LABEL[item.id],
        })),
      },
    },
    { headers: gate.headers }
  );
}
