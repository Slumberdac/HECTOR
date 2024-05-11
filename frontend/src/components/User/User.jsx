import React from "react";
import { Link } from "react-router-dom";
import "./User.css";

const User = () => {
	// extract the user id from the URL
	const uid = window.location.pathname.split("/")[2];

	// fetch the user data from the server
	fetch(`http://localhost:5000/api/v1/users/${uid}`)
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error("User not found");
			}
		})
		.then((data) => {

		})
		.catch((err) => {
			alert(err.message);
		});

	return (
		<div>
			<h1>User</h1>
			<Link to="/users">Back to Users</Link>
		</div>
	);
};

export default User;
