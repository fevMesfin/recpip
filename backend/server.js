// require("dotenv").config();

// const express = require("express");

// const body_parser = require("body-parser");

// const morgan = require("morgan");
// const cors = require("cors");

// // const jwt = require("./middleware/jwt");

// const app = express();

// app.use(morgan("combined"));
// app.use(
//     cors({
//         origin: "*",
//     })
// );
// const port = process.env.EXPRESS_PORT;

// app.use(body_parser.json({ limit: "100mb" }));

// app.post("/users/login", require("./express/login"));

// app.listen(port, () => {
//   console.log(`Express server listening on ${port}`);
// });

// --- Active server below (keeps the original commented lines above intact) ---

require("dotenv").config();
const express = require("express");
const body_parser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(morgan("combined"));
// Configure CORS. Use a reflected origin to avoid strict string mismatches
// (e.g. trailing slash differences) during local development. For
// production you should restrict this to an explicit origin string or
// validate the origin in a custom function.
app.use(
	cors({
		// reflect the request origin in the Access-Control-Allow-Origin header
		origin: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"x-hasura-admin-secret",
			"x-hasura-access-key",
		],
		credentials: true,
	})
);

const port = parseInt(process.env.EXPRESS_PORT || process.env.PORT || "8053", 10) || 8053;

app.use(body_parser.json({ limit: "100mb" }));

// Handle malformed JSON bodies gracefully
app.use((err, req, res, next) => {
	if (err && err.type === 'entity.parse.failed') {
		console.error('Malformed JSON in request:', req.method, req.url);
		return res.status(400).json({ error: 'Invalid JSON payload' });
	}
	return next(err);
});

// Compute Hasura endpoint once and make available to handlers via app.locals
const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT || process.env.HASURA_ENDPOINT || process.env.HASURA_GRAPHQL_URL || process.env.HASURA_URL || null;
app.locals.HASURA_GRAPHQL_ENDPOINT = hasuraEndpoint;

// Mount the login/register handlers implemented in express/
app.post("/users/login", require("./express/login"));
app.post("/users/register", require("./express/register"));

app.get("/", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "development" }));

// Basic error handler for async handlers
app.use((err, req, res, next) => {
	console.error("Unhandled error in request:", err && err.stack ? err.stack : err);
	if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
});

// Start server and attach error handlers
const server = app.listen(port, () => {
	const addr = server.address() || { address: '0.0.0.0', port };
	const host = addr.address === '::' || addr.address === '0.0.0.0' ? 'localhost' : addr.address;
	const displayUrl = `http://${host}:${addr.port}`;
	console.log(`Express server listening — PID=${process.pid} — ${displayUrl}`);
	console.log(`Hasura endpoint: ${hasuraEndpoint || '(not set)'}`);
	console.log(`Hasura admin secret present: ${!!(process.env.HASURA_ADMIN_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET)}`);
	console.log(`JWT secret present: ${!!process.env.JWT_SECRET}`);
});

server.on("error", (err) => {
	if (err && err.code === "EADDRINUSE") {
		console.error(`Port ${port} is already in use. Another process is listening on that port.`);
		console.error("If you want to run the server locally, stop the other process or change EXPRESS_PORT in .env");
		process.exit(1);
	} else {
		console.error("Server error:", err);
		process.exit(1);
	}
});

process.on("unhandledRejection", (reason) => {
	console.error("Unhandled Rejection at:", reason);
});

process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err && err.stack ? err.stack : err);
	process.exit(1);
});

// Graceful shutdown on SIGINT/SIGTERM
function shutdown(signal) {
	console.log(`Received ${signal}. Shutting down gracefully...`);
	server.close(() => {
		console.log('Server closed. Exiting.');
		process.exit(0);
	});
	// Force exit after 5s
	setTimeout(() => {
		console.error('Forcing shutdown after timeout.');
		process.exit(1);
	}, 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
