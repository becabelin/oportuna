import { buildLlmsTxt, llmsResponse } from "@/lib/llms";

export const revalidate = 300;

export function GET() {
  return llmsResponse(buildLlmsTxt());
}
