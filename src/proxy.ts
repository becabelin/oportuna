import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_REALM,
  COOKIE_ADMIN,
  adminSecret,
  aplicarCookieAdmin,
  clienteIp,
  producaoFechada,
  temCredencialAdmin,
} from "@/lib/admin-auth";
import { LIMITES_ADMIN_LOGIN } from "@/lib/limites-api";
import {
  checarJanela,
  consultarJanela,
  headersLimite,
  type ResultadoLimite,
} from "@/lib/rate-limit";

function desafioAdmin() {
  return new NextResponse("Acesso restrito.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

function bloqueioAdmin(limite: Extract<ResultadoLimite, { ok: false }>) {
  return new NextResponse("Muitas tentativas. Espere um pouco.", {
    status: 429,
    headers: {
      "Retry-After": String(limite.retryAfterSec),
      "Cache-Control": "no-store",
      ...headersLimite(limite),
    },
  });
}

export async function proxy(request: NextRequest) {
  const secret = adminSecret();
  if (!secret) {
    if (producaoFechada()) {
      return new NextResponse("Acesso restrito.", {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      });
    }
    return NextResponse.next();
  }

  const ip = clienteIp(request);
  const peek = await consultarJanela("admin-fail", ip, LIMITES_ADMIN_LOGIN);
  if (!peek.ok) return bloqueioAdmin(peek);

  if (temCredencialAdmin(request.headers, request.cookies.get(COOKIE_ADMIN)?.value)) {
    const response = NextResponse.next();
    aplicarCookieAdmin(response, request);
    return response;
  }

  const after = await checarJanela("admin-fail", ip, LIMITES_ADMIN_LOGIN);
  if (!after.ok) return bloqueioAdmin(after);
  return desafioAdmin();
}

export const config = {
  matcher: ["/fontes", "/fontes/:path*", "/cadastrar", "/cadastrar/:path*"],
};
