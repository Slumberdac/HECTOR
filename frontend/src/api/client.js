/**
 * The single place that knows how to talk to the API.
 *
 * The base URL comes from the build environment instead of being pasted into
 * every component, so the same source tree can point at a local dev server, a
 * staging box, or production. In the deployed setup the frontend and API share
 * an origin behind the reverse proxy, so the default relative "/api/v1" is all
 * that is needed and no CORS is involved.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(
	/\/$/,
	""
);

/** An error carrying the status and the message the API actually returned. */
export class ApiError extends Error {
	constructor(message, status, details) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}

	/** Flattened "field: message" list, handy for form-level display. */
	get fieldMessages() {
		return (this.details ?? []).map((d) => d.message);
	}
}

async function request(path, { method = "GET", body, signal } = {}) {
	let response;
	try {
		response = await fetch(`${BASE_URL}${path}`, {
			method,
			// Sends the httpOnly session cookie. The token is never readable
			// from JavaScript, so an XSS bug cannot steal the session.
			credentials: "include",
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined,
			signal,
		});
	} catch (cause) {
		if (cause.name === "AbortError") throw cause;
		throw new ApiError("Could not reach the server", 0);
	}

	if (response.status === 204) {
		return null;
	}

	let payload = null;
	if (response.headers.get("content-type")?.includes("application/json")) {
		payload = await response.json().catch(() => null);
	}

	if (!response.ok) {
		throw new ApiError(
			payload?.message || `Request failed (${response.status})`,
			response.status,
			payload?.details
		);
	}

	return payload;
}

export const api = {
	get: (path, opts) => request(path, { ...opts, method: "GET" }),
	post: (path, body, opts) =>
		request(path, { ...opts, method: "POST", body }),
	patch: (path, body, opts) =>
		request(path, { ...opts, method: "PATCH", body }),
	delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export { BASE_URL };
