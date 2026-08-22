import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./Navigation/Nav";
import Welcome from "./Welcome/Welcome";
import UsersRegistry from "./User/UsersRegistry";
import User from "./User/User";
import RocksRegistry from "./Rock/RocksRegistry";
import Rock from "./Rock/Rock";
import Profile from "./User/Profile";
import SignUp from "./User/SignUp";
import SignIn from "./User/SignIn";
import { AuthProvider } from "../context/AuthContext";
import NotFound from "../assets/404-not-found.webp";
import "./App.css";

const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						{/* One layout route rather than repeating <Nav /> for
						    every path, and real URL params instead of parsing
						    window.location by hand. */}
						<Route element={<Nav />}>
							<Route index path="/" element={<Welcome />} />
							<Route path="/users" element={<UsersRegistry />} />
							<Route path="/users/:uid" element={<User />} />
							<Route path="/rocks" element={<RocksRegistry />} />
							<Route path="/rocks/:rid" element={<Rock />} />
							<Route path="/profile" element={<Profile />} />
							<Route path="/signup" element={<SignUp />} />
							<Route path="/signin" element={<SignIn />} />
							<Route
								path="*"
								element={
									<div id="not-found">
										<img
											src={NotFound}
											alt="Page not found"
										/>
									</div>
								}
							/>
						</Route>
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</div>
	);
};

export default App;
