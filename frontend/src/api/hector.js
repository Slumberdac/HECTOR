import { api } from "./client";

/** Every endpoint the app uses, named once. */
export const auth = {
	register: (payload) => api.post("/auth/register", payload),
	login: (payload) => api.post("/auth/login", payload),
	logout: () => api.post("/auth/logout"),
	me: (opts) => api.get("/auth/me", opts),
};

export const users = {
	list: (opts) => api.get("/users", opts),
	get: (uid, opts) => api.get(`/users/${uid}`, opts),
	update: (uid, payload) => api.patch(`/users/${uid}`, payload),
	remove: (uid) => api.delete(`/users/${uid}`),
	rocks: (uid, opts) => api.get(`/users/${uid}/rocks`, opts),
	adopt: (uid, rid) => api.post(`/users/${uid}/rocks/${rid}`),
	release: (uid, rid) => api.delete(`/users/${uid}/rocks/${rid}`),
};

export const rocks = {
	list: (opts) => api.get("/rocks", opts),
	get: (rid, opts) => api.get(`/rocks/${rid}`, opts),
	create: (payload) => api.post("/rocks", payload),
	update: (rid, payload) => api.patch(`/rocks/${rid}`, payload),
	remove: (rid) => api.delete(`/rocks/${rid}`),
};

/** Fresh random avatar, matching what the API assigns at registration. */
export const randomAvatar = () => ({
	pfp_eyes: Math.floor(Math.random() * 16) + 1,
	pfp_mouth: Math.floor(Math.random() * 14) + 1,
	pfp_color: `#${[0, 0, 0]
		.map(() =>
			Math.floor(Math.random() * (256 - 100) + 100)
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()
		)
		.join("")}`,
});
