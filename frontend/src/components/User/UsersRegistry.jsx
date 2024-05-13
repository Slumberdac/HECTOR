import React from "react";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import "./UsersRegistry.css";

export default function UsersRegistry() {
	const [userList, setUserList] = useState([]);

	useEffect(() => {
		fetch(
			"https://foura5-projet-synthese-gacoic.onrender.com/api/v1/users/"
		)
			.then((res) => res.json())
			.then((data) => {
				setUserList(data.users);
			});
	}, []);
	const [searchTerm, setSearchTerm] = useState("");
	const filteredList = userList?.filter((item) =>
		item["username"].toLowerCase().includes(searchTerm.toLowerCase())
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
			<div className="users-registry">
				{filteredList?.map((user) => (
					<UserCard user={user} className="user-card" />
				))}
			</div>
		</div>
	);
}
