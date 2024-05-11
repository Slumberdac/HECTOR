import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Pfp from "./Pfp";
import "./User.css";
import RockCard from "../Rock/RockCard";

const User = () => {
	// extract the user id from the URL
	const uid = window.location.pathname.split("/")[2];
	const [user, setUser] = useState({});
	const [isOwner, setIsOwner] = useState(false);
	const [rockList, setRockList] = useState([]);

	// fetch the user data from the server and set the user state
	useEffect(() => {
		fetch(`http://localhost:5000/api/v1/users/${uid}`)
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error("User not found");
				}
			})
			.then((data) => {
				setUser(data.user);
			})
			.catch((err) => {
				alert(err.message);
			});
	}, [uid]);

	// fetch the rocks data from the server and filters the list to the rocks the user owns
	useEffect(() => {
		fetch(`http://localhost:5000/api/v1/rocks/`)
			.then((res) => res.json())
			.then((data) => {
				setRockList(data.rocks.filter((rock) => rock.owner === uid));
			});
	}, [uid]);
	return (
		<div>
			<div className="user-container">
				<Pfp
					eyes={user.pfp_eyes ?? 1}
					mouth={user.pfp_mouth ?? 1}
					color={user.pfp_color ?? "#999"}
					className="pfp"
				/>
				<h1 id="username">{user.username}</h1>

				<ul className="rock-list">
					{rockList?.map((rock) => (
						<RockCard key={rock._id} rock={rock} />
					))}
				</ul>
			</div>
			<Link to="/users">Back to Users</Link>
		</div>
	);
};

export default User;
