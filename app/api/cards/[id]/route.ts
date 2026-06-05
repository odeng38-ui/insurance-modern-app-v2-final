import { NextResponse } from 'next/server';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || "";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";

const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const sql = `SELECT * FROM insurance_cards WHERE id = ?`;

  try {
    const response = await fetch(D1_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params: [id] }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('D1 Error:', data.errors);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    const results = data.result[0].results;
    if (!results || results.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const row = results[0];
    const formattedResult = {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      key_points: JSON.parse(row.key_points || '[]'),
      images: JSON.parse(row.images || '[]')
    };

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch card detail' }, { status: 500 });
  }
}
