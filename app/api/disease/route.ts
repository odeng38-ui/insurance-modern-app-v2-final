import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !dbId || !apiToken) {
    return NextResponse.json({ error: 'Missing D1 credentials' }, { status: 500 });
  }

  const d1Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  try {
    let results: any[] = [];
    const cleanQuery = query?.trim() || "";

    if (!cleanQuery) {
      return NextResponse.json([]);
    }

    // if query is short (under 3 chars), strictly search only code prefix and Korean name
    if (cleanQuery.length < 3) {
      const sql = `SELECT * FROM disease_codes WHERE code LIKE ? OR name_ko LIKE ? ORDER BY code ASC LIMIT 50`;
      const params = [`${cleanQuery}%`, `%${cleanQuery}%`];
      
      const res = await fetch(d1Url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql, params }),
      });
      const data = await res.json();
      if (data.success && data.result && data.result.length > 0) {
        results = data.result[0].results || [];
      }
    } else {
      // normal full search for longer terms
      const sql = `SELECT * FROM disease_codes WHERE code LIKE ? OR name_ko LIKE ? OR name_en LIKE ? ORDER BY code ASC LIMIT 50`;
      const params = [`${cleanQuery}%`, `%${cleanQuery}%`, `%${cleanQuery}%`];
      
      const res = await fetch(d1Url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql, params }),
      });
      const data = await res.json();
      if (data.success && data.result && data.result.length > 0) {
        results = data.result[0].results || [];
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('D1 disease codes fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
