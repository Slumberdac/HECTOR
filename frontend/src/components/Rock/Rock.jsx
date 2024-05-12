import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Rock.css";
import UserCard from "../User/UserCard";
import Pfp from "../User/Pfp";

const Rock = () => {
	// extract the rock id from the URL
	const rid = window.location.pathname.split("/")[2];
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
                setUser(rock.owner)
			})
			.catch((err) => {
				alert(err.message);
			});
	}, [rid]);

	return (
		<div>
			<div className="rock-container">
				<div className="rock-info">
                    <h1 id="name">{rock.name}</h1>
                    <img src={rock.image} alt={rock.name} />
                    <h2 id="gender">Gender: {rock.gender}</h2>
                    <h3 id="personnality">{rock.personality}</h3>
                    <p if="description">{rock.description}</p>
                    {user && (
                        <Pfp
                            eyes={user.pfp_eyes ?? 1}
                            mouth={user.pfp_mouth ?? 1}
                            color={user.pfp_color ?? "#999"}
                            className="pfp" 
                        />
                    )}
                    <h1 id="username">{rock.name}</h1>
				</div>
			</div>
			<Link to="/rocks">Back to Rocks</Link>
		</div>
	);
};

export default Rock;
