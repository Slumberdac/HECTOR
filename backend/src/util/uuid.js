const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Documents are keyed by UUID, so mongoose throws a CastError on any id that
 * is not one. Checking first turns "not a uuid" into a clean 404 rather than a
 * 500 with a stack trace.
 */
const isUuid = (value) => typeof value === "string" && UUID_RE.test(value);

module.exports = { isUuid };
