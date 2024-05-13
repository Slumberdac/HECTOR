import React, { useState } from "react";
import Card from "../Card/Card.jsx";
import NewRockForm from "./NewRockForm.jsx";
import "./RockCard.css";

const AddRockCard = () => {
	const [showForm, setShowForm] = useState(false);

	const handleAddRockClick = () => {
		setShowForm(true);
	};

	return (
		<li className="rock-card">
			<Card className="rock-card-container">
				<div className="image-container">
					<div className="add-rock" onClick={handleAddRockClick}>
						+
					</div>
				</div>
			</Card>
			{showForm && <NewRockForm />}
		</li>
	);
};

export default AddRockCard;
