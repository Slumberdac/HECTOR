import { Link } from "react-router-dom";

import Card from "../Card/Card.jsx";
import Missing from "../../assets/MissingImage.jsx";
import "./RockCard.css";

const RockCard = ({ rock }) => {
	return (
		<li className="rock-card">
			<Link to={`/rocks/${rock._id}`} className="rock-link">
				<Card className="rock-card-container">
					<div className="image-container">
						{rock.owner && (
							<div className="home">
								{rock.name} found; the way home
							</div>
						)}
						{/* `!== undefined` was true for a rock with no image
						    at all, since the API sends null. */}
						{rock.image ? (
							<img
								src={rock.image}
								alt={rock.name}
								loading="lazy"
							/>
						) : (
							<Missing />
						)}
					</div>
					<h3 id="name">{rock.name}</h3>
				</Card>
			</Link>
		</li>
	);
};

export default RockCard;
