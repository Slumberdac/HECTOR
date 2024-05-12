import "./RockCard.css";
import Card from "../Card/Card.jsx";
import React from "react";
import { Link } from "react-router-dom";
import Missing from "../../assets/MissingImage.js";

const RockCard = ({ rock }) => {
	return (
		<li className="rock-card">
			<Link to={`/rocks/${rock._id}`} className="rock-link">
				<Card className="rock-card-container">
					{rock.image !== undefined ? (
						<div className="image-container">
							{rock.owner && (
								<div className="home">{rock.name} found; their way home</div>
							)}
							<img src={rock.image} alt={rock.name} />
						</div>
					) : (
						<Missing />
					)}
					<h3 id="name">{rock.name}</h3>
				</Card>
			</Link>
		</li>
	);
};

export default RockCard;
