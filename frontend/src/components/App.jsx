import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./Navigation/Nav";
import Welcome from "./Welcome/Welcome";
import UsersRegistry from "./User/UsersRegistry";
import RocksRegistry from "./Rock/RocksRegistry";
import Profile from "./User/Profile";
import SignUp from "./User/SignUp";
import SignIn from "./User/SignIn";
import "./App.css";
const App = () => {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Nav />}>
						<Route index element={<Welcome />} />
					</Route>
					<Route path="/users" element={<Nav />}>
						<Route index element={<UsersRegistry />} />
					</Route>
					<Route path="/rocks" element={<Nav />}>
						<Route index element={<RocksRegistry />} />
					</Route>
					<Route path="/profile" element={<Nav />}>
						<Route index element={<Profile />} />
					</Route>
					<Route path="/signup" element={<Nav />}>
						<Route index element={<SignUp />} />
					</Route>
					<Route path="/signin" element={<Nav />}>
						<Route index element={<SignIn />} />
					</Route>
					<Route path="*" element={<h1>404 Not Found</h1>} />
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;
