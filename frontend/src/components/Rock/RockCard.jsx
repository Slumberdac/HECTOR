import "./RockCard.css";
import Card from "../Card/Card.jsx";
import React from "react";
import { Link } from "react-router-dom";

const RockCard = ({ rock }) => {
	return (
		<li className="rock-card">
			<Link to={`/rocks/${rock._id}`}>
				<Card className="rock-card-container">
					<img src={rock.image} alt={rock.name} />
					<h3 id="name">{rock.name}</h3>
				</Card>
			</Link>
		</li>
	);
};

export default RockCard;
