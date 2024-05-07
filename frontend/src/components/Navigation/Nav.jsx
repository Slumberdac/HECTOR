import React from "react";
import { useState, useEffect } from "react";
import "./Nav.css";
import SvgBurgerMenu from "../../assets/BurgerMenu";
function Nav() {
	const [isNavOpen, setIsNavOpen] = useState(false);
	const toggleNav = () => {
		setIsNavOpen(!isNavOpen);
	};
	return (
		<>
			<div className="nav-container">
				<div className="users-button">Users</div>
				<div className="rocks-button">Companions</div>
			</div>
		</>
	);
}

export default Nav;
