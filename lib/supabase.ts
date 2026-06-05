import { InsuranceCard } from "./types";

/**
 * Searches for insurance cards using D1 API Route
 */
export async function searchInsuranceCards(query: string, category?: string) {
  try {
    const url = new URL('/api/cards', window.location.origin);
    if (query) url.searchParams.append('query', query);
    if (category && category !== '전체') url.searchParams.append('category', category);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch cards');
    
    const data = await res.json();
    return data as InsuranceCard[];
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
}

/**
 * Retrieves a single card with full details from D1 API Route
 */
export async function getCardDetail(id: string) {
  try {
    const res = await fetch(`/api/cards/${id}`);
    if (!res.ok) throw new Error('Failed to fetch card details');
    
    const data = await res.json();
    return data as InsuranceCard;
  } catch (error) {
    console.error("Detail Fetch Error:", error);
    throw error;
  }
}
