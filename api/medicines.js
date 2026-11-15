import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const isCode = (c) => typeof c === 'string' && /^\d{6}$/.test(c)

const COLUMNS = sql`id, account_code, name, dose_mg::float8 AS dose_mg, frequency, is_active, created_at, updated_at`

// GET   /api/medicines?code=123456                       -> { medicines } (active only)
// POST  /api/medicines { code, name, dose_mg, frequency } -> { medicine }
// PATCH /api/medicines { code, id, name, dose_mg, frequency } -> { medicine }
// PATCH /api/medicines { code, id, is_active: false }     -> { medicine } (soft delete)
export default async function handler(req, res) {
  try {
    const code = req.method === 'GET' ? req.query.code : req.body?.code
    if (!isCode(code)) return res.status(400).json({ error: 'Invalid account code' })

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT ${COLUMNS} FROM medicines
        WHERE account_code = ${code} AND is_active = true
        ORDER BY created_at ASC`
      return res.status(200).json({ medicines: rows })
    }

    if (req.method === 'POST') {
      const { name, dose_mg = null, frequency = null } = req.body
      if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })
      const rows = await sql`
        INSERT INTO medicines (account_code, name, dose_mg, frequency)
        VALUES (${code}, ${name.trim()}, ${dose_mg}, ${frequency})
        RETURNING ${COLUMNS}`
      return res.status(200).json({ medicine: rows[0] })
    }

    if (req.method === 'PATCH') {
      const { id } = req.body
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })
      let rows
      if (req.body.is_active === false) {
        rows = await sql`
          UPDATE medicines SET is_active = false, updated_at = now()
          WHERE id = ${id} AND account_code = ${code}
          RETURNING ${COLUMNS}`
      } else {
        const { name, dose_mg = null, frequency = null } = req.body
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })
        rows = await sql`
          UPDATE medicines
          SET name = ${name.trim()}, dose_mg = ${dose_mg}, frequency = ${frequency}, updated_at = now()
          WHERE id = ${id} AND account_code = ${code}
          RETURNING ${COLUMNS}`
      }
      if (!rows[0]) return res.status(404).json({ error: 'Medicine not found' })
      return res.status(200).json({ medicine: rows[0] })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Database error' })
  }
}
