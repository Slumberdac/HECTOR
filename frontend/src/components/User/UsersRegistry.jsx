import React from "react";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import "./UsersRegistry.css";

export default function UsersRegistry() {
	const [userList, setUserList] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/api/v1/users/")
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
		<div>
			<h1>Users Registry</h1>
			<input
				type="text"
				placeholder="Rechercher"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="search-bar"
			/>

			<div className="users-grid">
                {filteredList?.map((user, index) => (
				index % 2 === 0 && (
					<div key={user._id} className="user-row">
                        <UserCard user={user} className="user-card" />
                        {filteredList[index + 1] && (
                            <UserCard user={filteredList[index + 1]} className="user-card" />
                        )}
                    </div>
				)))}
            </div>
		</div>
	);
}
