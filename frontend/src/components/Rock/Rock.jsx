import React, { useEffect } from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import Hammer from "../../assets/Hammer.js";
import Missing from "../../assets/MissingImage.js";
import "./Rock.css";
const Rock = () => {
	// extract the rock id from the URL
	const rid = window.location.pathname.split("/")[2];
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);
	const [rock, setRock] = useState({});
	const [user, setUser] = useState({});
	// fetch the rock data from the server and set the rock state
	useEffect(() => {
		fetch(
			`https://foura5-projet-synthese-gacoic.onrender.com/api/v1/rocks/${rid}`
		)
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error("Rock not found");
				}
			})
			.then((data) => {
				setRock(data.rock);
				setUser(rock.owner);
			})
			.catch((err) => {
				alert(err.message);
			});
	}, [rid]);

	const handleAdoption = () => {
		fetch(
			`https://foura5-projet-synthese-gacoic.onrender.com/api/v1/users/${cookies.uuid}/rocks/${rock._id}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((res) => {
				if (res.ok) {
					alert(`${rock.name} found; the way home`);
					// refresh the page
					window.location.reload();
				} else {
					throw new Error("Failed to adopt rock");
				}
			})
			.catch(
				(err) => {
					alert(err.message);
				},
				[rock.id, cookies.uuid]
			);
	};

	const handleAbandon = () => {
		fetch(
			`https://foura5-projet-synthese-gacoic.onrender.com/api/v1/users/${cookies.uuid}/rocks/${rock._id}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((res) => {
				if (res.ok) {
					alert(`${rock.name} will find; another way home`);
					// refresh the page
					window.location.reload();
				} else {
					throw new Error("Failed to abandon rock");
				}
			})
			.catch(
				(err) => {
					alert(err.message);
				},
				[rock.id, cookies.uuid]
			);
	};
	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this rock?")) {
			fetch(
				`https://foura5-projet-synthese-gacoic.onrender.com/api/v1/rocks/${rock._id}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			)
				.then((res) => {
					if (res.ok) {
						alert(`${rock.name} forever lost; the way home`);
						window.location.href = "/rocks";
					} else {
						throw new Error("Failed to delete rock");
					}
				})
				.catch((err) => {
					alert(err.message);
				});
		}
	};
	return (
		<div>
			<div className="rock-container">
				<div className="rock-info">
					<h1 id="name">{rock.name}</h1>
					{rock.image ? (
						<img src={rock.image} alt={rock.name} />
					) : (
						<Missing />
					)}
					<h2 id="gender">Gender: {rock.gender}</h2>
					<h3 id="personnality">{rock.personality}</h3>
					<p if="description">{rock.description}</p>
					<div className="buttons">
						{!rock.owner && cookies.uuid && (
							<button
								className="adopt-button"
								onClick={handleAdoption}
							>
								Adopt
							</button>
						)}
						{rock.owner === cookies?.uuid && cookies.uuid && (
							<button
								className="abandon-button"
								onClick={handleAbandon}
							>
								Abandon
							</button>
						)}
						{rock.owner === cookies?.uuid && cookies.uuid && (
							<button
								className="delete-button"
								onClick={handleDelete}
							>
								<Hammer />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Rock;
