import { useEffect, useState } from "react";

import UserCard from "./UserCard";
import { users } from "../../api/hector";
import "./UsersRegistry.css";

export default function UsersRegistry() {
	const [userList, setUserList] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const controller = new AbortController();
		users
			.list({ signal: controller.signal })
			.then((data) => setUserList(data.users))
			.catch((err) => {
				if (err.name !== "AbortError") setError(err.message);
			})
			.finally(() => setLoading(false));
		return () => controller.abort();
	}, []);

	const filteredList = userList.filter((item) =>
		item.username.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="users-registry-container">
			<h1>Users Registry</h1>
			<input
				type="text"
				placeholder="Filter"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="search-bar"
			/>
			{loading && <p>Loading…</p>}
			{error && <p className="error">{error}</p>}
			<div className="users-registry">
				{filteredList.map((user) => (
					<UserCard
						key={user._id}
						user={user}
						className="user-card"
					/>
				))}
			</div>
		</div>
	);
}
