import React from "react";
import { useState } from "react";
import "./RocksRegistry.css";

const NewRockForm = () => {
	const [name, setName] = useState("");
	const [gender, setGender] = useState("");
	const [personality, setPersonality] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		const data = {
			name: name,
			gender: gender,
			personality: personality,
			description: description,
			image: image,
		};
		fetch(
			"https://foura5-projet-synthese-gacoic.onrender.com/api/v1/rocks/",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			}
		)
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				// refresh the page
				window.location.href = "/";
			});
	};

	return (
		<div className="new-rock-form">
			<form>
				<h1>New Companion</h1>
				<input
					type="text"
					placeholder="Name"
					onChange={(e) => setName(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Gender"
					onChange={(e) => setGender(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Personality"
					onChange={(e) => setPersonality(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Description"
					onChange={(e) => setDescription(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Image link"
					onChange={(e) => setImage(e.target.value)}
				/>
				<div className="buttons">
					<button type="submit" onClick={handleSubmit}>
						Submit
					</button>
					<button type="close">Cancel</button>
				</div>
			</form>
		</div>
	);
};

export default NewRockForm;
