import "./UserCard.css";
import Card from "../Card/Card.jsx";
import Pfp from "./Pfp.jsx";
import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
	return (
		<li className="user-card">
			<Link to={`/users/${user._id}`}>
				<Card className="user-card-container">
					<Pfp
						eyes={user.pfp_eyes}
						mouth={user.pfp_mouth}
						color={user.pfp_color}
					/>

					<h3 id="username">{user.username}</h3>
				</Card>
			</Link>
		</li>
	);
};

export default UserCard;
