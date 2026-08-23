import type { ApiError } from "./types";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
};

export function json<T>(body: T, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...init?.headers,
    },
  });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>
) {
  const body: ApiError = { error: { code, message, details } };
  return json(body, { status });
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
