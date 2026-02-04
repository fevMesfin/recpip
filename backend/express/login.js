
/**
 * POST /users/login
 * body: { email, password }
 *
 * Environment variables used:
 * - HASURA_GRAPHQL_URL / HASURA_GRAPHQL_ENDPOINT (required)
 * - HASURA_GRAPHQL_ADMIN_SECRET (optional but needed to upgrade plaintext passwords)
 * - JWT_SECRET (used to sign tokens)
 * - BCRYPT_SALT_ROUNDS (optional, default 10)
 *
 * This handler queries Hasura for the user row, accepts plaintext or bcrypt
 * passwords, upgrades plaintext to bcrypt when possible, and returns a JWT
 * containing Hasura claims under https://hasura.io/jwt/claims.
 */

const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function isBcryptHash(s) {
	return typeof s === "string" && s.startsWith("$2");
}

module.exports = async function (req, res) {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) return res.status(400).json({ error: "email and password are required" });

		const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || process.env.HASURA_ENDPOINT || process.env.HASURA_GRAPHQL_URL;
		if (!HASURA_GRAPHQL_ENDPOINT) return res.status(500).json({ error: "HASURA_GRAPHQL_ENDPOINT not configured" });

		const query = `
			query getUser($email: String!) {
				users(where: {email: {_eq: $email}}) {
					id
					name
					email
					password
				}
			}
		`;

		const headers = { "Content-Type": "application/json" };
		const adminSecret = process.env.HASURA_ADMIN_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET;
		if (adminSecret) headers["x-hasura-admin-secret"] = adminSecret;

		const graphqlResp = await axios.post(HASURA_GRAPHQL_ENDPOINT, { query, variables: { email } }, { headers });
		const users = graphqlResp.data && graphqlResp.data.data && graphqlResp.data.data.users;
		if (!users || users.length === 0) return res.status(401).json({ error: "Invalid credentials" });

		const user = users[0];
		const stored = user.password;

		let isMatch = false;
		let upgradedHash = null;

		if (isBcryptHash(stored)) {
			isMatch = await bcrypt.compare(password, stored);
		} else {
			isMatch = password === stored;
			if (isMatch) {
				const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
				upgradedHash = bcrypt.hashSync(password, saltRounds);
			}
		}

		if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

		if (upgradedHash && adminSecret) {
			try {
				const mutation = `
					mutation updatePassword($id: uuid!, $password: String!) {
						update_users_by_pk(pk_columns: {id: $id}, _set: {password: $password}) { id }
					}
				`;
				await axios.post(HASURA_GRAPHQL_ENDPOINT, { query: mutation, variables: { id: user.id, password: upgradedHash } }, { headers });
			} catch (e) {
				console.error("Failed to upgrade password", e && e.response ? e.response.data || e.response : e);
			}
		}

		const jwtSecret = process.env.JWT_SECRET || process.env.HASURA_GRAPHQL_JWT_SECRET || "change_me";
		const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

		const hasuraClaims = {
			"x-hasura-allowed-roles": ["user"],
			"x-hasura-default-role": "user",
			"x-hasura-user-id": user.id,
		};

		const tokenPayload = { sub: user.id, email: user.email, name: user.name, "https://hasura.io/jwt/claims": hasuraClaims };
		const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn });

		return res.json({ token, expires_in: expiresIn, user: { id: user.id, name: user.name, email: user.email } });
	} catch (err) {
		console.error("/users/login error:", err && err.response ? err.response.data || err.response : err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

