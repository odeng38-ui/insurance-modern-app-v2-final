import { NextRequest, NextResponse } from "next/server";
import { searchInsuranceCards } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=query&cat=category
 * Searches for insurance cards.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("cat") || "전체";

  try {
    const data = await searchInsuranceCards(query, category);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Search API Error:", error.message);
    return NextResponse.json(
      { error: "검색 중 알 수 없는 오류가 발생했습니다. 나중에 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
