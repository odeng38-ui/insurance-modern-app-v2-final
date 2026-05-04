import { NextRequest, NextResponse } from "next/server";
import { getCardDetail } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/card/[id]
 * Retrieves details for a specific insurance card.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "카드 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const data = await getCardDetail(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Card Detail API Error [${id}]:`, error.message);
    return NextResponse.json(
      { error: "카드 상세 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
