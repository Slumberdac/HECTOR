import React from "react";
import { useState, useEffect } from "react";

import Logo from "../../assets/Logo";
import Background from "../../assets/background.jpg";
import "./Welcome.css";

function Welcome() {
	const [scrollY, setScrollY] = useState(0);
	const [logoAnimationComplete, setLogoAnimationComplete] = useState(false);

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

	console.log(scrollY);

	useEffect(() => {
		// Simulate logo animation completion after 2 seconds
		const timer = setTimeout(() => {
			setLogoAnimationComplete(true);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

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
					{/* when scrollY reaches 50, slide logo to the left and fade in some text */}
					<Logo
						style={{
							transform: `translateX(${
								scrollY > 50 ? "-30%" : "0"
							})`,
							transition: "transform 1.5s ease-out",
						}}
					/>
					{logoAnimationComplete && (
						<>
							<h1
								style={{
									position: "absolute",
									top: "38.5%",
									left: "56.3%",
									transform: `translate(-50%, -50%)`,
									fontSize: "6rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								R
							</h1>
							<h2
								style={{
									position: "absolute",
									top: "43.8%",
									left: "61%",
									transform: `translate(-50%, -50%)`,
									fontSize: "3rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								ocks
							</h2>
							<h1
								style={{
									position: "absolute",
									top: "42.5%",
									left: "52.3%",
									transform: `translate(-50%, -50%)`,
									fontSize: "6rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								O
							</h1>
							<h2
								style={{
									position: "absolute",
									top: "48%",
									left: "54.5%",
									transform: `translate(-50%, -50%)`,
									fontSize: "3rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								f
							</h2>
							<h1
								style={{
									position: "absolute",
									top: "48.5%",
									left: "48.3%",
									transform: `translate(-50%, -50%)`,
									fontSize: "6rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								T
							</h1>
							<h2
								style={{
									position: "absolute",
									top: "53.5%",
									left: "52.5%",
									transform: `translate(-50%, -50%)`,
									fontSize: "3rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								errain
							</h2>
							<h1
								style={{
									position: "absolute",
									top: "52%",
									left: "44.2%",
									transform: `translate(-50%, -50%)`,
									fontSize: "6rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								C
							</h1>
							<h2
								style={{
									position: "absolute",
									top: "58.5%",
									left: "52.5%",
									transform: `translate(-50%, -50%)`,
									fontSize: "3rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								ontainment
							</h2>
							<h1
								style={{
									position: "absolute",
									top: "57.7%",
									left: "40.2%",
									transform: `translate(-50%, -50%)`,
									fontSize: "6rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								E
							</h1>
							<h2
								style={{
									position: "absolute",
									top: "63.5%",
									left: "48.7%",
									transform: `translate(-50%, -50%)`,
									fontSize: "3rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								xtravagant
							</h2>
							<h1
								style={{
									position: "absolute",
									top: "62%",
									left: "36.2%",
									transform: `translate(-50%, -50%)`,
									fontSize: "6rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								H
							</h1>
							<h2
								style={{
									position: "absolute",
									top: "68.5%",
									left: "42%",
									transform: `translate(-50%, -50%)`,
									fontSize: "3rem",
									fontWeight: "bold",
									opacity: `${scrollY > 50 ? "1" : "0"}`,
									transition: "opacity 1s",
								}}
							>
								ector's
							</h2>
						</>
					)}
				</div>
				<div className="welcome-content">
					<p>test test test test test test</p>
				</div>
			</div>
		</>
	);
}

export default Welcome;
