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

	const handleSubmit = (e) => {
		e.preventDefault();
		// Send a POST request to the server
		fetch("http://localhost:5000/api/v1/users/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: name,
				username: username,
				password: password,
			}),
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					res.text()
						.then((text) => {
							throw new Error(text);
						})
						.catch((err) => {
							alert(err.message.split('"')[3]); // TODO: display error message on the page
						});
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
				alert(err); // TODO: display error message on the page
			});
	};

	return (
		<div className="signup-container">
			<h1>Sign Up</h1>
			<form onSubmit={handleSubmit} className="signup-form">
				<input
					type="text"
					placeholder="Name"
					onChange={(e) => setName(e.target.value)}
					maxLength={10}
				/>
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
				<button type="submit">Sign Up</button>
			</form>
			<p>
				<Link to="/signin">Already have an account? Sign In</Link>
			</p>
		</div>
	);
}
