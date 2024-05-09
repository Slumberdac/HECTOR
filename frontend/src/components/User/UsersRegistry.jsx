import React from "react";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";

export default function UsersRegistry() {
	const [userList, setUserList] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/api/v1/users/")
			.then((res) => res.json())
			.then((data) => {
				setUserList(data.users);
			})
			.catch((err) => console.log(err));
	}, []);
	return (
		<div>
			<h1>Users Registry</h1>

			<ul className="users-registry">
				{userList.map((user) => (
					<UserCard key={user._id} user={user} />
				))}
			</ul>
		</div>
	);
}
