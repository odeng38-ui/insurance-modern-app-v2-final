import { NextResponse } from 'next/server';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || "";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";

const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';

  let sql = `SELECT id, title, category, tags, summary, key_points, image_count, images FROM insurance_cards WHERE 1=1`;
  const params: string[] = [];

  if (category && category !== '전체') {
    sql += ` AND category = ?`;
    params.push(category);
  }

  if (query) {
    sql += ` AND (title LIKE ? OR summary LIKE ? OR tags LIKE ?)`;
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  sql += ` ORDER BY title ASC LIMIT 500`;

  try {
    const response = await fetch(D1_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('D1 Error:', data.errors);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    const results = data.result[0].results || [];
    
    // Parse JSON strings back to arrays
    const formattedResults = results.map((row: any) => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      key_points: JSON.parse(row.key_points || '[]'),
      images: JSON.parse(row.images || '[]')
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
