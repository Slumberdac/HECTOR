import React from "react";
import { useCookies } from "react-cookie";

export default function Profile() {
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);

	return (
		<div>
			<h1>Profile</h1>
			{/* Button to reroll pfp features */}
			<button
				onClick={() => {
					const pfp_eyes = Math.floor(Math.random() * 16) + 1;
					const pfp_mouth = Math.floor(Math.random() * 14) + 1;
					const pfp_color = `#${[0, 0, 0]
						.map(() =>
							Math.floor(Math.random() * (256 - 100) + 100)
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
									throw new Error("Failed to delete account");
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
	);
}
