import { buildLlmsTxt, llmsResponse } from "@/lib/llms";

export const dynamic = "force-dynamic";

export function GET() {
  return llmsResponse(buildLlmsTxt());
}
