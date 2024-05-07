import React from "react";
import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";

import Logo from "../../assets/Logo";
import Pfp from "../User/Pfp";
import Head from "../../assets/pfps/head";
import QuestionMark from "../../assets/pfps/QuestionMark";
import "./Nav.css";
function Nav() {
	const [isLoggedIn, setIsLoggedIn] = React.useState(false);
	const [user, setUser] = React.useState({});

	React.useEffect(() => {
		// if a uuid is stored in cookies, set isLoggedIn to true
		if (document.cookie.includes("uuid")) {
			// if (true) {
			// fetch user data
			// fetch(`http://localhost:5000/users/${uuid}`, {
			fetch(
				"http://localhost:5000/api/v1/users/0ad0d1c9-90d3-4e7d-845a-8d97fa10a32e",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			)
				.then((res) => res.json())
				.then((data) => {
					setUser(data.user);
					setIsLoggedIn(true);
				});
		}
	}, []);

	/* if logo is hovered, set color prop to white, else black */
	const [color, setColor] = React.useState("#050604");
	const handleHover = () => {
		setColor("#222");
	};
	const handleLeave = () => {
		setColor("#050604");
	};

	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};
		handleScroll();

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		// if scrollY is greater than 0, add class "scrolled" to nav-container
		<div className={`nav-container ${scrollY > 20 ? "scrolled" : ""}`}>
			<nav>
				<Link to="/">
					<Logo
						color={color}
						onMouseEnter={handleHover}
						onMouseLeave={handleLeave}
					/>
				</Link>
				<ul>
					<li>
						<Link to="/users" className="users-button">
							<h1>Users</h1>
						</Link>
					</li>
					<li>
						<Link to="/rocks" className="rocks-button">
							<h1>Companions</h1>
						</Link>
					</li>
				</ul>
				{isLoggedIn && (
					<Link to="/profile" className="nav-button">
						<Pfp
							color={user.pfp_color ?? "#999"}
							eye={user.pfp_eyes ?? 1}
							mouth={user.pfp_mouth ?? 1}
						/>
					</Link>
				)}
				{!isLoggedIn && (
					<Link to="/signup" className="nav-button">
						<div className="missing-pfp">
							<Head color="#999999" />
							<QuestionMark color="#000" />
						</div>
					</Link>
				)}
			</nav>
			<Outlet />
		</div>
	);
}

export default Nav;
