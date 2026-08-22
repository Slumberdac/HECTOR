import { useState } from "react";
import { Link } from "react-router-dom";

import Card from "../Card/Card.jsx";
import NewRockForm from "./NewRockForm.jsx";
import { useAuth } from "../../context/AuthContext";
import "./RockCard.css";

const AddRockCard = ({ onCreated }) => {
	const { isLoggedIn } = useAuth();
	const [showForm, setShowForm] = useState(false);

	// Only offer the affordance to someone who can actually use it — the API
	// rejects anonymous creates.
	if (!isLoggedIn) {
		return (
			<li className="rock-card">
				<Link to="/signin" className="rock-link">
					<Card className="rock-card-container">
						<div className="image-container">
							<div className="add-rock">+</div>
						</div>
					</Card>
				</Link>
			</li>
		);
	}

	return (
		<li className="rock-card">
			<Card className="rock-card-container">
				<button
					type="button"
					className="image-container"
					aria-label="Add a companion"
					onClick={() => setShowForm(true)}
				>
					<div className="add-rock">+</div>
				</button>
			</Card>
			{showForm && (
				<NewRockForm
					onCancel={() => setShowForm(false)}
					onCreated={() => {
						setShowForm(false);
						onCreated?.();
					}}
				/>
			)}
		</li>
	);
};

export default AddRockCard;
