import { cookies, headers } from "next/headers";

import {
  COOKIE_ADMIN,
  adminSecret,
  producaoFechada,
  temCredencialAdmin,
} from "./admin-auth";

export async function paginaAdminLiberada() {
  if (!adminSecret() && !producaoFechada()) return true;
  const incoming = await headers();
  const jar = await cookies();
  return temCredencialAdmin(incoming, jar.get(COOKIE_ADMIN)?.value ?? null);
}
