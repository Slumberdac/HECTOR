import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

import "./SignIn.css";

export default function SignIn() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);
	const [error, setError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		// Send a PATCH request to the server
		fetch(
			"https://foura5-projet-synthese-gacoic.onrender.com/api/v1/users/signin",
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: username,
					password: password,
				}),
			}
		)
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					res.json()
						.then((data) => {
							setError(data.message);
							if (!username || !password) {
								setError("Please fill in all fields");
							}
							throw new Error("Sign in failed");
						})
						.catch((err) => {
							console.log(error);
						});
				}
			})
			.then((data) => {
				// Save the data to cookies
				setCookie("uuid", data.user);

				// Redirect to the home page
				window.location.href = "/";
			})
			.catch((err) => {
				console.log(error);
			});
	};

	return (
		<div className="signin-container">
			<form className="signin-form" onSubmit={handleSubmit}>
				<h1>Sign In</h1>
				{error && <label className="error">{error}</label>}
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
				<Link to="/signup">Don't have an account? Sign Up</Link>
			</p>
		</div>
	);
}
