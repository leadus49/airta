const PAT  = process.env.AIRTABLE_PAT;
const BASE = process.env.AIRTABLE_BASE || 'apph2BTZHTVV7Opar';

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  const url    = new URL(req.url);
  const table  = url.searchParams.get('table') || '';
  const fields = url.searchParams.getAll('fields[]');
  const offset = url.searchParams.get('offset') || '';
  const max    = url.searchParams.get('maxRecords') || '100';

  if (!table) return new Response(JSON.stringify({error:'missing table'}), {status:400});
  if (!PAT)   return new Response(JSON.stringify({error:'missing PAT env var'}), {status:500});

  const atParams = new URLSearchParams({ pageSize: max });
  fields.forEach(f => atParams.append('fields[]', f));
  if (offset) atParams.set('offset', offset);

  const atUrl = `https://api.airtable.com/v0/${BASE}/${table}?${atParams}`;

  try {
    const res = await fetch(atUrl, {
      headers: { Authorization: `Bearer ${PAT}` }
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const config = { path: '/api/airtable' };
