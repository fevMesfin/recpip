const axios = require('axios')
const bcrypt = require('bcryptjs')

/**
 * POST /users/register
 * Accepts either { name, email, password } (direct) or { input: { name, email, password } } (Hasura action wrapper)
 * Inserts a user via Hasura (uses admin secret) and returns { success, message, user_id, user }
 */

module.exports = async function (req, res) {
    console.log('Register request body:', req.body);
  try {
    const body = req.body || {}
    const input = body.input || body
    const name = input.name
    const email = input.email
    const password = input.password

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' })
    }

    const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || process.env.HASURA_ENDPOINT || process.env.HASURA_GRAPHQL_URL
    if (!HASURA_GRAPHQL_ENDPOINT) return res.status(500).json({ success: false, message: 'HASURA_GRAPHQL_ENDPOINT not configured' })

    const adminSecret = process.env.HASURA_ADMIN_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET
    const headers = { 'Content-Type': 'application/json' }
    if (adminSecret) headers['x-hasura-admin-secret'] = adminSecret

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
    const hashed = bcrypt.hashSync(password, saltRounds)

    const mutation = `
      mutation insertUser($name: String!, $email: String!, $password: String!) {
        insert_users_one(object: { name: $name, email: $email, password: $password }) {
          id
          name
          email
          created_at
        }
      }
    `

    const resp = await axios.post(HASURA_GRAPHQL_ENDPOINT, { query: mutation, variables: { name, email, password: hashed } }, { headers })

    if (resp.data && resp.data.errors) {
      const err = resp.data.errors[0]
      return res.status(400).json({ success: false, message: err.message || 'failed to create user', errors: resp.data.errors })
    }

    const user = resp.data && resp.data.data && resp.data.data.insert_users_one
    if (!user) return res.status(500).json({ success: false, message: 'no user returned from DB' })

    // Return flat fields that match Hasura action output (avoid nested objects)
    return res.json({
      success: true,
      message: 'User created',
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      user_created_at: user.created_at
    })
  } catch (err) {
    console.error('/users/register error:', err && err.response ? err.response.data || err.response : err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
