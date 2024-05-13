import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import "./SignUp.css";

export default function SignUp() {
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);
	const [error, setError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		// Send a POST request to the server
		fetch(
			"https://foura5-projet-synthese-gacoic.onrender.com/api/v1/users/register",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: name,
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
							if (!name || !username || !password) {
								setError("Please fill in all fields");
							} else if (
								data.message ===
								"A user with the same username already exists"
							) {
								setError(data.message);
							} else if (
								!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*=])[A-Za-z\d!@#$%^&*=]{8,}$/.test(
									password
								) ||
								data.message === "password: Invalid value"
							) {
								setError(
									"Password must contain at least 8 characters, one letter, one number, and one special character"
								);
							}
							throw new Error("Sign in failed");
						})
						.catch((err) => {});
				}
			})
			.then((data) => {
				if (data === undefined) {
					return;
				}
				// Save the data to cookies
				setCookie("uuid", data.user);

				// Redirect to the home page
				window.location.href = "/";
			})
			.catch((err) => {
				alert(err);
			});
	};

	return (
		<div className="signup-container">
			<form onSubmit={handleSubmit} className="signup-form">
				<h1>Sign Up</h1>
				{error && <label className="error">{error}</label>}
				<input
					type="text"
					placeholder="Name"
					onChange={(e) => setName(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Username"
					onChange={(e) => setUsername(e.target.value)}
					maxLength={10}
				/>
				<input
					type="password"
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit">Sign Up</button>
			</form>
			<p>
				<Link to="/signin">Already have an account? Sign In</Link>
			</p>
		</div>
	);
}
