import { useState } from "react";

import { rocks } from "../../api/hector";
import { useAuth } from "../../context/AuthContext";
import "./RocksRegistry.css";

const EMOJI = /\p{Extended_Pictographic}/u;

const NewRockForm = ({ onCreated, onCancel }) => {
	const { isLoggedIn } = useAuth();

	const [form, setForm] = useState({
		name: "",
		gender: "",
		personality: "",
		description: "",
		image: "",
	});
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const update = (field) => (event) =>
		setForm((prev) => ({ ...prev, [field]: event.target.value }));

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		if (!isLoggedIn) {
			setError("You need to be signed in to add a companion");
			return;
		}

		// Client-side checks are a courtesy for fast feedback; the API
		// re-validates everything, so this is not the security boundary. The
		// old version checked the response *and then* reloaded the page
		// regardless of whether the request had actually succeeded.
		if (!form.name || !form.personality || !form.description) {
			setError("Please fill in name, personality and description");
			return;
		}
		if (
			[form.name, form.gender, form.personality, form.description].some(
				(v) => EMOJI.test(v)
			)
		) {
			setError("Please avoid using emojis");
			return;
		}

		setSubmitting(true);
		try {
			await rocks.create({
				...form,
				gender: form.gender || undefined,
				image: form.image || undefined,
			});
			onCreated?.();
		} catch (err) {
			setError(
				err.fieldMessages?.length
					? err.fieldMessages.join(". ")
					: err.message
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="new-rock-form">
			<form onSubmit={handleSubmit}>
				<h1>New Companion</h1>
				{error && (
					<label className="error" role="alert">
						{error}
					</label>
				)}
				<input
					type="text"
					placeholder="Name"
					value={form.name}
					onChange={update("name")}
				/>
				<input
					type="text"
					placeholder="Gender"
					value={form.gender}
					onChange={update("gender")}
				/>
				<input
					type="text"
					placeholder="Personality"
					value={form.personality}
					onChange={update("personality")}
				/>
				<input
					type="text"
					placeholder="Description"
					value={form.description}
					onChange={update("description")}
				/>
				<input
					type="url"
					placeholder="Image link"
					value={form.image}
					onChange={update("image")}
				/>
				<div className="buttons">
					<button type="submit" disabled={submitting}>
						{submitting ? "Saving…" : "Submit"}
					</button>
					<button type="button" onClick={onCancel}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default NewRockForm;
