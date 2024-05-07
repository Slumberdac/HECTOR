import React from "react";
import Logo from "../../assets/Logo";
import Background from "../../assets/background.jpg";
import SvgBurgerMenu from "../../assets/BurgerMenu.js";
import "./Welcome.css";

function Welcome() {
	return (
		<>
			<div
				className="background"
				style={{
					backgroundImage: `url(${Background})`,
					position: "relative",
				}}
			>
				<div className="welcome-logo">
					<div className="logo">
						<Logo />
					</div>
				</div>
				<div className="welcome-content">
					<p>test test test test test test</p>
				</div>
			</div>
		</>
	);
}

export default Welcome;
