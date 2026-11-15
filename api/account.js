import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const isCode = (c) => typeof c === 'string' && /^\d{6}$/.test(c)

// GET   /api/account?code=123456          -> { account } (null if not found)
// POST  /api/account { code }             -> { account } (creates if missing)
// PATCH /api/account { code, name, subtitle } -> { account }
export default async function handler(req, res) {
  try {
    const code = req.method === 'GET' ? req.query.code : req.body?.code
    if (!isCode(code)) return res.status(400).json({ error: 'Invalid account code' })

    if (req.method === 'GET') {
      const rows = await sql`SELECT code, name, subtitle FROM accounts WHERE code = ${code}`
      return res.status(200).json({ account: rows[0] || null })
    }

    if (req.method === 'POST') {
      await sql`INSERT INTO accounts (code) VALUES (${code}) ON CONFLICT (code) DO NOTHING`
      const rows = await sql`SELECT code, name, subtitle FROM accounts WHERE code = ${code}`
      return res.status(200).json({ account: rows[0] })
    }

    if (req.method === 'PATCH') {
      const { name = null, subtitle = null } = req.body
      const rows = await sql`
        UPDATE accounts SET name = ${name}, subtitle = ${subtitle}
        WHERE code = ${code}
        RETURNING code, name, subtitle`
      if (!rows[0]) return res.status(404).json({ error: 'Account not found' })
      return res.status(200).json({ account: rows[0] })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Database error' })
  }
}
