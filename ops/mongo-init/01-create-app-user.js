// Runs once, the first time the mongo data volume is created.
//
// The root account is only used to bootstrap; the API connects as a
// least-privilege user that can read and write the `hector` database and
// nothing else.
//
// Anything thrown here aborts initialisation and the container exits, which
// surfaces as "dependency failed to start: container mongo is unhealthy" with
// the real reason only visible in `docker compose logs mongo`. So every failure
// below prints what went wrong before it throws.

const username = process.env.MONGO_APP_USERNAME || "hector_app";
const password = process.env.MONGO_APP_PASSWORD;

if (!password) {
	print("");
	print("!! MONGO_APP_PASSWORD reached the mongo container empty or unset.");
	print(
		"!! Check .env for a duplicate MONGO_APP_PASSWORD line: the last one"
	);
	print("!! wins even when it is blank. Then `docker compose down -v` to");
	print("!! discard the half-built volume, because this script only runs on");
	print("!! an empty data directory.");
	print("");
	throw new Error("MONGO_APP_PASSWORD is not set");
}

// A separate handle rather than reassigning the global `db`, so the rest of the
// entrypoint keeps the connection it expects.
const hector = db.getSiblingDB("hector");

const existing = hector.getUsers().users.some((u) => u.user === username);

if (existing) {
	print(`application user '${username}' already exists, leaving it alone`);
} else {
	hector.createUser({
		user: username,
		pwd: password,
		roles: [{ role: "readWrite", db: "hector" }],
	});
	print(`created application user '${username}' on database 'hector'`);
}
