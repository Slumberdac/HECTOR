import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import "./SignUp.css";

export default function SignUp() {
	const { signUp, isLoggedIn, loading } = useAuth();
	const navigate = useNavigate();

	const [form, setForm] = useState({ name: "", username: "", password: "" });
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	if (!loading && isLoggedIn) {
		return <Navigate to="/profile" replace />;
	}

	const update = (field) => (event) =>
		setForm((prev) => ({ ...prev, [field]: event.target.value }));

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		if (!form.name || !form.username || !form.password) {
			setError("Please fill in all fields");
			return;
		}

		setSubmitting(true);
		try {
			await signUp(form);
			navigate("/profile");
		} catch (err) {
			// The API sends per-field messages for a 422; show them rather than
			// re-implementing the password rules here and letting the two
			// definitions drift apart.
			setError(
				err.fieldMessages?.length
					? err.fieldMessages.join(". ")
					: err.message
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="signup-container">
			<form onSubmit={handleSubmit} className="signup-form">
				<h1>Sign Up</h1>
				{error && (
					<label className="error" role="alert">
						{error}
					</label>
				)}
				<input
					type="text"
					placeholder="Name"
					autoComplete="name"
					value={form.name}
					onChange={update("name")}
					maxLength={60}
				/>
				<input
					type="text"
					placeholder="Username"
					autoComplete="username"
					value={form.username}
					onChange={update("username")}
					maxLength={30}
				/>
				<input
					type="password"
					placeholder="Password"
					autoComplete="new-password"
					value={form.password}
					onChange={update("password")}
				/>
				<button type="submit" disabled={submitting}>
					{submitting ? "Creating account…" : "Sign Up"}
				</button>
			</form>
			<p>
				<Link to="/signin">Already have an account? Sign In</Link>
			</p>
		</div>
	);
}
