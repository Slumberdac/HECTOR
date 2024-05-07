import React from "react";
import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";

import Logo from "../../assets/Logo";
import Pfp from "../User/Pfp";
import "./Nav.css";
function Nav() {
	/* if logo is hovered, set color prop to white, else black */
	const [color, setColor] = React.useState("#000");
	const handleHover = () => {
		setColor("#222");
		console.log("hovered");
	};
	const handleLeave = () => {
		setColor("#000");
		console.log("left");
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
				<Logo
					color={color}
					onMouseEnter={handleHover}
					onMouseLeave={handleLeave}
				/>
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
				<Link to="/profile" className="nav-button">
					<Pfp color="#999999" eye={15} mouth={8} />
				</Link>
			</nav>
			<Outlet />
		</div>
	);
}

export default Nav;
