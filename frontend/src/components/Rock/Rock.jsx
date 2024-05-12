import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Rock.css";
import Pfp from "../User/Pfp";
import { useCookies } from "react-cookie";
const Rock = () => {
	// extract the rock id from the URL
	const rid = window.location.pathname.split("/")[2];
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);
	const [rock, setRock] = useState({});
	const [user, setUser] = useState({});
	// fetch the rock data from the server and set the rock state
	useEffect(() => {
		fetch(`http://localhost:5000/api/v1/rocks/${rid}`)
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
			`http://localhost:5000/api/v1/users/${cookies.uuid}/rocks/${rock._id}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((res) => {
				if (res.ok) {
					alert(`${rock.name}; found the way home`);
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
			`http://localhost:5000/api/v1/users/${cookies.uuid}/rocks/${rock._id}`,
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
	return (
		<div>
			<div className="rock-container">
				<div className="rock-info">
					<h1 id="name">{rock.name}</h1>
					<img src={rock.image} alt={rock.name} />
					<h2 id="gender">Gender: {rock.gender}</h2>
					<h3 id="personnality">{rock.personality}</h3>
					<p if="description">{rock.description}</p>

					<h1 id="username">{rock.name}</h1>
					{!rock.owner && cookies.uuid && (
						<button
							className="adopt-button"
							onClick={handleAdoption}
						>
							adopt
						</button>
					)}
					{rock.owner === cookies?.uuid && cookies.uuid && (
						<button
							className="abandon-button"
							onClick={handleAbandon}
						>
							abandon
						</button>
					)}
				</div>
			</div>
			<Link to="/rocks">Back to Rocks</Link>
		</div>
	);
};

export default Rock;
