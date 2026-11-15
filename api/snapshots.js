import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const isCode = (c) => typeof c === 'string' && /^\d{6}$/.test(c)
const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)

// GET /api/snapshots?code=123456                          -> { snapshots } (newest first)
// PUT /api/snapshots { code, snapshot_date, medicines }   -> { snapshot } (one per day)
export default async function handler(req, res) {
  try {
    const code = req.method === 'GET' ? req.query.code : req.body?.code
    if (!isCode(code)) return res.status(400).json({ error: 'Invalid account code' })

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT account_code, snapshot_date::text AS snapshot_date, medicines
        FROM snapshots WHERE account_code = ${code}
        ORDER BY snapshot_date DESC`
      return res.status(200).json({ snapshots: rows })
    }

    if (req.method === 'PUT') {
      const { snapshot_date, medicines } = req.body
      if (!isDate(snapshot_date)) return res.status(400).json({ error: 'Invalid date' })
      if (!Array.isArray(medicines)) return res.status(400).json({ error: 'Invalid medicines' })
      const rows = await sql`
        INSERT INTO snapshots (account_code, snapshot_date, medicines)
        VALUES (${code}, ${snapshot_date}, ${JSON.stringify(medicines)}::jsonb)
        ON CONFLICT (snapshot_date, account_code)
        DO UPDATE SET medicines = EXCLUDED.medicines
        RETURNING account_code, snapshot_date::text AS snapshot_date, medicines`
      return res.status(200).json({ snapshot: rows[0] })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Database error' })
  }
}
