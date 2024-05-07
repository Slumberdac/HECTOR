import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./Navigation/Nav";
import Welcome from "./Welcome/Welcome";
import Profile from "./User/Profile";
import UsersRegistry from "./User/UsersRegistry";
import RocksRegistry from "./Rock/RocksRegistry";
import "./App.css";
const App = () => {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Nav />}>
						<Route index element={<Welcome />} />
					</Route>
					<Route path="/profile" element={<Nav />}>
						<Route index element={<Profile />} />
					</Route>
					<Route path="/users" element={<Nav />}>
						<Route index element={<UsersRegistry />} />
					</Route>
					<Route path="/rocks" element={<Nav />}>
						<Route index element={<RocksRegistry />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;
