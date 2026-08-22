import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../api/hector";

const AuthContext = createContext(null);

/**
 * Holds the signed-in user for the whole app.
 *
 * Previously every component read a `uuid` cookie for itself and trusted it,
 * which meant the UI's idea of "who am I" was whatever the browser happened to
 * hold. The session is now an httpOnly cookie the page cannot read, so the
 * source of truth is the server: we ask it once on load via /auth/me.
 */
export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		auth.me({ signal: controller.signal })
			.then((data) => setUser(data.user))
			// A 401 here just means "not signed in", which is not an error.
			.catch(() => setUser(null))
			.finally(() => setLoading(false));
		return () => controller.abort();
	}, []);

	const value = useMemo(
		() => ({
			user,
			loading,
			isLoggedIn: Boolean(user),
			async signIn(credentials) {
				const data = await auth.login(credentials);
				setUser(data.user);
				return data.user;
			},
			async signUp(payload) {
				const data = await auth.register(payload);
				setUser(data.user);
				return data.user;
			},
			async signOut() {
				await auth.logout().catch(() => {});
				setUser(null);
			},
			setUser,
		}),
		[user, loading]
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside an <AuthProvider>");
	}
	return context;
}
