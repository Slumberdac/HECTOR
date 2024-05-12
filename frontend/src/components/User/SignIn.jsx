import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

import "./SignIn.css";

export default function SignIn() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);

	const handleSubmit = (e) => {
		e.preventDefault();
		// Send a PATCH request to the server
		fetch("http://localhost:5000/api/v1/users/signin", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error("Invalid username or password");
				}
			})
			.then((data) => {
				// Save the data to cookies
				setCookie("uuid", data.user);

				// Redirect to the home page
				window.location.href = "/";
			})
			.catch((err) => {
				alert(err.message); // TODO: display error message on the page
			});
	};

	return (
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
				<Link to="/signup">Don't have an account? Sign Up</Link>
			</p>
		</div>
	);
}
