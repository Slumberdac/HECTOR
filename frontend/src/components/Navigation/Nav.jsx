import React from "react";
import { useState, useEffect } from "react";
import "./Nav.css";
import Pfp from "../User/Pfp";
function Nav() {
	const [isNavOpen, setIsNavOpen] = useState(false);
	const toggleNav = () => {
		setIsNavOpen(!isNavOpen);
	};
	return (
		<>
			<div className="nav-container">
				<Pfp color="#999999" eye={15} mouth={8} className="pfp" />
				<div className="users-button">Users</div>
				<div className="rocks-button">Companions</div>
			</div>
		</>
	);
}

export default Nav;
