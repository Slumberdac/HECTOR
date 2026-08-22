// Centralised, validated configuration.
//
// Every value the application needs comes from the environment and is checked
// once, at boot. If something is missing or malformed the process exits with a
// readable message instead of failing later with an obscure runtime error.
require("dotenv").config();

const { z } = require("zod");

const schema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),

	PORT: z.coerce.number().int().positive().default(5000),

	// Full mongodb:// or mongodb+srv:// connection string.
	MONGODB_URI: z
		.string()
		.min(1, "MONGODB_URI is required")
		.refine((v) => /^mongodb(\+srv)?:\/\//.test(v), {
			message: "MONGODB_URI must start with mongodb:// or mongodb+srv://",
		}),

	// Secret used to sign session tokens. Generate with:
	//   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
	JWT_SECRET: z
		.string()
		.min(32, "JWT_SECRET must be at least 32 characters long"),

	JWT_EXPIRES_IN: z.string().default("7d"),

	// Comma-separated list of origins allowed to call the API with credentials.
	// Leave empty when the API and the frontend are served from the same origin
	// (the production setup behind Caddy), which needs no CORS at all.
	CORS_ORIGINS: z
		.string()
		.default("")
		.transform((v) =>
			v
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)
		),

	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
		.default("info"),

	// Set to 1 when the API sits behind a reverse proxy so express reads the
	// real client IP from X-Forwarded-For (needed for correct rate limiting).
	TRUST_PROXY: z.coerce.number().int().min(0).default(0),

	BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
	const issues = parsed.error.issues
		.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
		.join("\n");
	console.error(`Invalid environment configuration:\n${issues}\n`);
	process.exit(1);
}

const env = parsed.data;

module.exports = Object.freeze({
	...env,
	isProduction: env.NODE_ENV === "production",
	isTest: env.NODE_ENV === "test",
});
