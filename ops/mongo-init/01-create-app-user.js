// Runs once, the first time the mongo data volume is created.
//
// The root account is only used to bootstrap; the API connects as a
// least-privilege user that can read and write the `hector` database and
// nothing else.
const username = process.env.MONGO_APP_USERNAME || "hector_app";
const password = process.env.MONGO_APP_PASSWORD;

if (!password) {
	throw new Error("MONGO_APP_PASSWORD is not set");
}

db = db.getSiblingDB("hector");

db.createUser({
	user: username,
	pwd: password,
	roles: [{ role: "readWrite", db: "hector" }],
});

print(`created application user '${username}' on database 'hector'`);
