import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./Navigation/Nav";
import Welcome from "./Welcome/Welcome";
import UsersRegistry from "./User/UsersRegistry";
import User from ".//User/User";
import RocksRegistry from "./Rock/RocksRegistry";
import Rock from "./Rock/Rock";
import Profile from "./User/Profile";
import SignUp from "./User/SignUp";
import SignIn from "./User/SignIn";
import NotFound from "../assets/404 NotFound.png";
import "./App.css";
const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Nav />}>
						<Route index element={<Welcome />} />
					</Route>
					<Route path="/users" element={<Nav />}>
						<Route index element={<UsersRegistry />} />
					</Route>
					<Route path="/users/:uid" element={<Nav />}>
						<Route index element={<User />} />
					</Route>
					<Route path="/rocks" element={<Nav />}>
						<Route index element={<RocksRegistry />} />
					</Route>
					<Route path="/rocks/:rid" element={<Nav />}>
						<Route index element={<Rock />} />
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
					<Route
						path="*"
						element={
							<div id="not-found">
								<img src={NotFound} />
							</div>
						}
					/>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;
