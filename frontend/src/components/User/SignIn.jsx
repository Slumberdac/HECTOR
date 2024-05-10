import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "./SignIn.css";

export default function SignIn() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Username: ", username);
		console.log("Password: ", password);
	};

	return (
		<div>
			<div className="signin-container">
				<h1>Sign In</h1>
				<form className="signin-form" onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Username"
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Password"
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button>Sign In</button>
				</form>
				<p>
					Don't have an account? <Link to="/signup">Sign Up</Link>
				</p>
			</div>
		</div>
	);
}
