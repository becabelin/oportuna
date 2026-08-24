import type { NextRequest } from "next/server";

import type { ApiError } from "./types";

export const CORS_PUBLIC = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
};

export const CORS_CHAVES = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type CorsMode = "public" | "chaves" | "none";

type JsonInit = ResponseInit & { cors?: CorsMode };

function corsHeaders(mode: CorsMode = "public") {
  if (mode === "none") return {};
  if (mode === "chaves") return CORS_CHAVES;
  return CORS_PUBLIC;
}

export function json<T>(body: T, init?: JsonInit) {
  const { cors = "public", headers, ...rest } = init ?? {};
  return Response.json(body, {
    ...rest,
    headers: {
      ...corsHeaders(cors),
      ...headers,
    },
  });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>,
  init?: Omit<JsonInit, "status">
) {
  const body: ApiError = { error: { code, message, details } };
  return json(body, { ...init, status });
}

export function optionsResponse(mode: CorsMode = "public") {
  return new Response(null, { status: 204, headers: corsHeaders(mode) });
}

export function emptyResponse(status: number) {
  return new Response(null, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function requireJson(request: NextRequest) {
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.includes("application/json")) {
    return apiError(415, "unsupported_media_type", "Envie o corpo como JSON.");
  }
  return null;
}
