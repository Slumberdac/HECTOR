import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Pfp from "./Pfp";
import RockCard from "../Rock/RockCard";
import { users } from "../../api/hector";
import "./User.css";

const User = () => {
	// useParams rather than slicing window.location.pathname, so the component
	// re-renders correctly on client-side navigation between two profiles.
	const { uid } = useParams();

	const [user, setUser] = useState(null);
	const [rockList, setRockList] = useState([]);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const controller = new AbortController();
		const opts = { signal: controller.signal };

		// One request for the owner's rocks instead of downloading every rock
		// in the database and filtering in the browser.
		Promise.all([users.get(uid, opts), users.rocks(uid, opts)])
			.then(([userData, rockData]) => {
				setUser(userData.user);
				setRockList(rockData.rocks);
			})
			.catch((err) => {
				if (err.name !== "AbortError") setError(err.message);
			});

		return () => controller.abort();
	}, [uid]);

	if (error) {
		return (
			<div className="user-container">
				<h1>{error}</h1>
			</div>
		);
	}
	if (!user) {
		return (
			<div className="user-container">
				<h1>Loading…</h1>
			</div>
		);
	}

	const filteredList = rockList.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="user-container">
			<div className="user-info">
				<Pfp
					eyes={user.pfp_eyes ?? 1}
					mouth={user.pfp_mouth ?? 1}
					color={user.pfp_color ?? "#999"}
					className="pfp"
				/>
				<h1 id="username">{user.username}</h1>
			</div>

			<input
				type="text"
				placeholder="Filter"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="search-bar"
			/>
			{filteredList.length > 0 ? (
				<div className="rock-list-container">
					<ul className="rock-list">
						{filteredList.map((rock) => (
							<RockCard key={rock._id} rock={rock} />
						))}
					</ul>
				</div>
			) : (
				<h1>This user does not own any rocks</h1>
			)}
		</div>
	);
};

export default User;
