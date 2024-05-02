import React from "react";
import Logo from "../../assets/Logo.svg";
import Background from "../../assets/background.jpg";
import BurgerMenu from "../../assets/BurgerMenu.svg";
import "./Welcome.css";
import { useState, useEffect } from "react";

function Welcome() {
	const [scrollPos, setScrollPos] = useState(0);
	const [foregroundOpacity, setForegroundOpacity] = useState(1);
	useEffect(() => {
		const onScroll = () => {
			setScrollPos(window.scrollY);
			setForegroundOpacity(1 - window.scrollY / 500);
		};

		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return (
		<>
			<div className="burger-menu">
				<img src={BurgerMenu} alt="burger-menu" />
			</div>
			<div
				className="background"
				style={{
					backgroundImage: `url(${Background})`,
					backgroundPositionY: `${scrollPos * 2}`,
				}}
			>
				<div
					className="welcome-logo"
					style={{
						opacity: `${foregroundOpacity}`,
						backgroundColor: `rgba(255, 255, 255, ${foregroundOpacity})`,
					}}
				>
					<img src={Logo} alt="logo" />
				</div>
			</div>
			<div className="welcome-content">test test test test test test</div>
		</>
	);
}

export default Welcome;
