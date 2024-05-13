import React from "react";
import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";

import Logo from "../../assets/Logo";
import Pfp from "../User/Pfp";
import Head from "../../assets/pfps/head";
import QuestionMark from "../../assets/pfps/QuestionMark";
import "./Nav.css";
import { useCookies } from "react-cookie";
function Nav() {
	const [cookies, setCookie, removeCookie] = useCookies(["uuid"]);
	const [isLoggedIn, setIsLoggedIn] = React.useState(false);
	const [user, setUser] = React.useState({});

	React.useEffect(() => {
		// if a uuid is stored in cookies, set isLoggedIn to true
		if (cookies.uuid && cookies.uuid !== "undefined") {
			fetch(`http://localhost:5000/api/v1/users/${cookies.uuid}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.then((data) => {
					setUser(data.user);
					setIsLoggedIn(true);
				})
				.catch((err) => {});
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
		<div
			className={`nav-container ${
				scrollY > window.innerHeight / 2000 ? "scrolled" : ""
			}`}
		>
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
						<Link to="/">
							<h1>Home</h1>
						</Link>
					</li>
					<li>
						<Link to="/users">
							<h1>Users</h1>
						</Link>
					</li>
					<li>
						<Link to="/rocks">
							<h1>Companions</h1>
						</Link>
					</li>
					<li>
						{isLoggedIn ? (
							<Link to="/profile">
								<h1>Profile</h1>
							</Link>
						) : (
							<Link to="/signin">
								<h1>Sign In</h1>
							</Link>
						)}
					</li>
				</ul>
				{isLoggedIn ? (
					<Link to="/profile" className="nav-button">
						<Pfp
							color={user.pfp_color ?? "#999"}
							eyes={user.pfp_eyes ?? 1}
							mouth={user.pfp_mouth ?? 1}
						/>
					</Link>
				) : (
					<Link to="/signin" className="nav-button">
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
