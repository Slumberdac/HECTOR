import React from "react";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import Pfp from "./Pfp";
import "./Profile.css";

export default function Profile() {
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);

	const [user, setUser] = useState({});
	const [rocks, setRocks] = useState([]);

	useEffect(() => {
		if (cookies.uuid && cookies.uuid !== "undefined") {
			fetch(`http://localhost:5000/api/v1/users/${cookies.uuid}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.then((data) => {
					setUser(data.user);
					console.log(data.user);
				})
				.catch((err) => {});

			fetch(`http://localhost:5000/api/v1/users/${cookies.uuid}/rocks`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.then((data) => {
					setRocks(data.rocks);
				})
				.catch((err) => {});
		}
	}, []);

	return (
		<div className="profile-container">
			{/* Display the user's pfp */}
			<Pfp
				color={user.pfp_color ?? "#999"}
				eyes={user.pfp_eyes ?? 1}
				mouth={user.pfp_mouth ?? 1}
			/>
			<div className="profile-info">
				<h1>Profile</h1>
				{/* Display the user's name */}
				<h2>Name: {user.name}</h2>
				{/* Display the user's username */}
				<h2>Username: {user.username}</h2>
				<div className="buttons">
					{/* Button to reroll pfp features */}
					<button
						onClick={() => {
							const pfp_eyes = Math.floor(Math.random() * 16) + 1;
							const pfp_mouth =
								Math.floor(Math.random() * 14) + 1;
							const pfp_color = `#${[0, 0, 0]
								.map(() =>
									Math.floor(
										Math.random() * (256 - 100) + 100
									)
										.toString(16)
										.padStart(2, "0")
										.toUpperCase()
								)
								.join("")}`;
							fetch(
								`http://localhost:5000/api/v1/users/${cookies.uuid}`,
								{
									method: "PATCH",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										pfp_eyes: pfp_eyes,
										pfp_mouth: pfp_mouth,
										pfp_color: pfp_color,
									}),
								}
							)
								.then((res) => {
									if (res.ok) {
										window.location.reload();
									} else {
										throw new Error("Failed to reroll pfp");
									}
								})
								.catch((err) => {
									alert(err.message);
								});
						}}
					>
						Reroll PFP
					</button>
					{/* button to sign out which clears the cookies */}
					<button
						onClick={() => {
							removeCookie("uuid");

							window.location.href = "/";
						}}
					>
						Sign Out
					</button>

					{/* Button to delete account with validation */}
					<button
						onClick={() => {
							if (
								window.confirm(
									"Are you sure you want to delete your account?"
								)
							) {
								fetch(
									`http://localhost:5000/api/v1/users/${cookies.uuid}`,
									{
										method: "DELETE",
									}
								)
									.then((res) => {
										if (res.ok) {
											removeCookie("uuid");
											window.location.href = "/";
										} else {
											throw new Error(
												"Failed to delete account"
											);
										}
									})
									.catch((err) => {
										alert(err.message);
									});
							}
						}}
					>
						Delete Account
					</button>
				</div>
			</div>
			{/* scrollable container of rockCards */}
			<h2 id="your-rocks">Your Rocks</h2>
			<div className="rock-card-container-profile">
				{rocks.map((rock) => {
					return (
						<div className="rock-card" key={rock._id}>
							<h3>{rock.name}</h3>
							<p>{rock.description}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}
