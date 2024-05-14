import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./RocksRegistry.css";

const NewRockForm = (props) => {
	console.log(props);
	const [name, setName] = useState("");
	const [gender, setGender] = useState("");
	const [personality, setPersonality] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState("");
	const [error, setError] = useState("");

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
			.then((res) => {
				res.json();
				if (
					!name ||
					!gender ||
					!personality ||
					!description ||
					!image
				) {
					throw Error("Please fill in all fields");
				} else if (
					/\p{Extended_Pictographic}/u.test(name) ||
					/\p{Extended_Pictographic}/u.test(gender) ||
					/\p{Extended_Pictographic}/u.test(personality) ||
					/\p{Extended_Pictographic}/u.test(description)
				) {
					throw Error("Please avoid using emojis");
				} else if (image) {
					try {
						new URL(image);
					} catch (error) {
						throw Error("Invalid image link");
					}
				}
				window.location.reload();
			})
			.catch((err) => {
				setError(err.message);
			});
	};

	return (
		<div className="new-rock-form">
			<form>
				<h1>New Companion</h1>
				{error && <label className="error">{error}</label>}
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
					<Link to="/">
						<button type="close">Cancel</button>
					</Link>
				</div>
			</form>
		</div>
	);
};

export default NewRockForm;
