import { createClient } from "@supabase/supabase-js";
import { InsuranceCard } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase environment variables are missing! Ensure .env.local is configured.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Searches for insurance cards using full-text search and category filter.
 */
export async function searchInsuranceCards(query: string, category?: string) {
  let rpcQuery = supabase
    .from("insurance_cards")
    .select("id, title, category, tags, summary, key_points, image_count, images");

  // Category filter
  if (category && category !== "전체") {
    rpcQuery = rpcQuery.eq("category", category);
  }

  // Full-text search
  if (query) {
    rpcQuery = rpcQuery.textSearch("fts", query, {
      type: "websearch",
      config: "simple",
    });
  } else {
    // Default: Sort by title or other existing field
    rpcQuery = rpcQuery.order('title', { ascending: true });
  }

  const { data, error } = await rpcQuery.limit(500);

  if (error) {
    console.error("Search Error:", error.message);
    throw new Error("검색 중 오류가 발생했습니다: " + error.message);
  }

  return data as InsuranceCard[];
}

/**
 * Retrieves a single card with full details.
 */
export async function getCardDetail(id: string) {
  const { data, error } = await supabase
    .from("insurance_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Detail Fetch Error:", error.message);
    throw new Error("상세 정보를 불러올 수 없습니다: " + error.message);
  }

  return data as InsuranceCard;
}
/**
 * Fetches suggestions based on the user's input.
 */
// 질병코드 검색
export async function searchDiseaseCodes(query: string) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // 검색어를 코드(code) 필드에만 한정하여 검색하도록 수정 (사용자 요청)
  const { data, error } = await supabase
    .from('disease_codes')
    .select('*')
    .ilike('code', `${cleanQuery}%`)
    .order('code', { ascending: true })
    .limit(100);

  if (error) {
    console.error("Disease Search Error:", error.message);
    return [];
  }

  return data;
}

// --- Authentication ---

// Google 로그인
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // 로그인 후 현재 사이트로 돌아오기
    }
  });
  if (error) throw error;
  return data;
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 현재 유저 세션 확인
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

export async function getSuggestions(query: string) {
  if (!query || query.length < 1) return [];

  const { data, error } = await supabase
    .from("insurance_cards")
    .select("title")
    .ilike("title", `%${query}%`)
    .limit(5);

  if (error) {
    console.error("Suggestions Error:", error.message);
    return [];
  }

  return data.map((item) => item.title);
}

/**
 * --- Admin Functions ---
 */

const ADMIN_EMAILS = [
  "odeng38@gmail.com",
  "odeng38@naver.com",
  "odeng38@kakao.com",
  "odeng38@odeng.com"
];

export function isAdmin(email: string | undefined | null) {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  
  // Also check if the email is in the admin list
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
}

export async function createInsuranceCard(card: Omit<InsuranceCard, "id">) {
  const { data, error } = await supabase
    .from("insurance_cards")
    .insert([card])
    .select()
    .single();

  if (error) {
    console.error("Create Error:", error.message);
    throw new Error("자료 등록 중 오류가 발생했습니다: " + error.message);
  }

  return data as InsuranceCard;
}

export async function updateInsuranceCard(id: string, card: Partial<InsuranceCard>) {
  const { data, error } = await supabase
    .from("insurance_cards")
    .update(card)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Error:", error.message);
    throw new Error("자료 수정 중 오류가 발생했습니다: " + error.message);
  }

  return data as InsuranceCard;
}

export async function deleteInsuranceCard(id: string) {
  const { error } = await supabase
    .from("insurance_cards")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Error:", error.message);
    throw new Error("자료 삭제 중 오류가 발생했습니다: " + error.message);
  }
}
