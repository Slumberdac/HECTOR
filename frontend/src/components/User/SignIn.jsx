import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import "./SignIn.css";

export default function SignIn() {
	const { signIn, isLoggedIn, loading } = useAuth();
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	if (!loading && isLoggedIn) {
		return <Navigate to="/profile" replace />;
	}

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		if (!username || !password) {
			setError("Please fill in all fields");
			return;
		}

		setSubmitting(true);
		try {
			await signIn({ username, password });
			// Router navigation rather than window.location.reload(), so the
			// app keeps its state and does not round-trip the whole bundle.
			navigate("/profile");
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="signin-container">
			<form className="signin-form" onSubmit={handleSubmit}>
				<h1>Sign In</h1>
				{error && (
					<label className="error" role="alert">
						{error}
					</label>
				)}
				<input
					type="text"
					placeholder="Username"
					autoComplete="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					type="password"
					placeholder="Password"
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit" disabled={submitting}>
					{submitting ? "Signing in…" : "Sign In"}
				</button>
			</form>
			<p>
				<Link to="/signup">Don&apos;t have an account? Sign Up</Link>
			</p>
		</div>
	);
}
