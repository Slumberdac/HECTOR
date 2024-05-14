import React from "react";
import { useEffect, useState } from "react";
import RockCard from "./RockCard";
import AddRockCard from "./AddRockCard";
import "./RocksRegistry.css";

export default function RocksRegistry() {
	const [rockList, setRockList] = useState([]);

	useEffect(() => {
		fetch(
			"https://foura5-projet-synthese-gacoic.onrender.com/api/v1/rocks/"
		)
			.then((res) => res.json())
			.then((data) => {
				setRockList(data.rocks);
			});
	}, []);
	const [searchTerm, setSearchTerm] = useState("");
	const filteredList = rockList?.filter((item) =>
		item["name"].toLowerCase().includes(searchTerm.toLowerCase())
	);
	return (
		<div className="rocks-registry-container">
			<h1>Companion Registry</h1>
			<input
				type="text"
				placeholder="Filter"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="search-bar"
			/>
			<ul className="rocks-registry">
				<AddRockCard />
				{filteredList?.map((rock) => (
					!rock.owner && (
						<RockCard key={rock._id} rock={rock} />
					)
				))}
				{filteredList?.map((rock) => (
					rock.owner && (
						<RockCard key={rock._id} rock={rock} />
					)
				))}
			</ul>
		</div>
	);
}
