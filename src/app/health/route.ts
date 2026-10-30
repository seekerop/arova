import { GET as apiHealthGet, HEAD as apiHealthHead } from "@/app/api/health/route";

export const dynamic = "force-dynamic";

export async function GET() {
  return apiHealthGet();
}

export async function HEAD() {
  return apiHealthHead();
}
