import { useCallback, useEffect, useState } from "react";

import RockCard from "./RockCard";
import AddRockCard from "./AddRockCard";
import { rocks as rocksApi } from "../../api/hector";
import "./RocksRegistry.css";

export default function RocksRegistry() {
	const [rockList, setRockList] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	const load = useCallback((signal) => {
		return rocksApi
			.list({ signal })
			.then((data) => setRockList(data.rocks))
			.catch((err) => {
				if (err.name !== "AbortError") setError(err.message);
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal);
		return () => controller.abort();
	}, [load]);

	const filteredList = rockList.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
			{loading && <p>Loading…</p>}
			{error && <p className="error">{error}</p>}
			<ul className="rocks-registry">
				{/* Adding a companion refreshes the list in place rather than
				    reloading the whole page. */}
				<AddRockCard onCreated={() => load()} />
				{filteredList.map((rock) => (
					<RockCard key={rock._id} rock={rock} />
				))}
			</ul>
		</div>
	);
}
