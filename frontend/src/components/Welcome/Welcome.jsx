import React from "react";
import { useState, useEffect } from "react";

import Logo from "../../assets/Logo";
import Background from "../../assets/background.jpg";
import "./Welcome.css";

function Welcome() {
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
		<div className="welcome">
			<div className="welcome-background">
				<img src={Background} alt="background" />
			</div>
			<div className="welcome-logo">
				{/* when scrollY reaches 50, slide logo to the left and fade in some text */}
				<Logo
					color="#050604"
					style={{
						transform: `translateX(${scrollY > 20 ? "-15%" : "0"})`,
						transition: "transform 1.5s ease-out",
					}}
				/>
				<h1
					style={{
						position: "absolute",
						top: "38.5%",
						left: "59.5%",
						transform: `translate(-50%, -50%)`,
						fontSize: "6rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					R
				</h1>
				<h2
					style={{
						position: "absolute",
						top: "43.8%",
						left: "64%",
						transform: `translate(-50%, -50%)`,
						fontSize: "3rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					ocks
				</h2>
				<h1
					style={{
						position: "absolute",
						top: "42.5%",
						left: "55%",
						transform: `translate(-50%, -50%)`,
						fontSize: "6rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					O
				</h1>
				<h2
					style={{
						position: "absolute",
						top: "48%",
						left: "57.2%",
						transform: `translate(-50%, -50%)`,
						fontSize: "3rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					f
				</h2>
				<h1
					style={{
						position: "absolute",
						top: "48.5%",
						left: "51.5%",
						transform: `translate(-50%, -50%)`,
						fontSize: "6rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					T
				</h1>
				<h2
					style={{
						position: "absolute",
						top: "53.5%",
						left: "55.5%",
						transform: `translate(-50%, -50%)`,
						fontSize: "3rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					errain
				</h2>
				<h1
					style={{
						position: "absolute",
						top: "52%",
						left: "47%",
						transform: `translate(-50%, -50%)`,
						fontSize: "6rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					C
				</h1>
				<h2
					style={{
						position: "absolute",
						top: "58.5%",
						left: "55%",
						transform: `translate(-50%, -50%)`,
						fontSize: "3rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					ontainment
				</h2>
				<h1
					style={{
						position: "absolute",
						top: "57.7%",
						left: "43.2%",
						transform: `translate(-50%, -50%)`,
						fontSize: "6rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					E
				</h1>
				<h2
					style={{
						position: "absolute",
						top: "63.5%",
						left: "51.4%",
						transform: `translate(-50%, -50%)`,
						fontSize: "3rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					xtravagant
				</h2>
				<h1
					style={{
						position: "absolute",
						top: "62%",
						left: "39.3%",
						transform: `translate(-50%, -50%)`,
						fontSize: "6rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					H
				</h1>
				<h2
					style={{
						position: "absolute",
						top: "68.5%",
						left: "45.2%",
						transform: `translate(-50%, -50%)`,
						fontSize: "3rem",
						fontWeight: "bold",
						opacity: `${scrollY > 20 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					ector's
				</h2>
			</div>
			{/* 200px spacing */}
			<div style={{ height: "200px" }}></div>
			<div className="welcome-content">
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
					sit amet sapien ut tortor pellentesque fringilla a et
					sapien. Curabitur luctus orci a mattis hendrerit. Sed
					porttitor ante nec libero vestibulum, ac varius ligula
					suscipit. In maximus mauris odio, a aliquet dui euismod eu.
					Pellentesque hendrerit eros eu imperdiet rutrum. Aliquam
					vehicula posuere nisl, nec tempus turpis aliquet non.
					Pellentesque ac accumsan tortor. Phasellus lobortis commodo
					purus, auctor ullamcorper augue accumsan quis. Quisque et
					viverra urna. Duis in elementum ante, non vehicula purus.
					Aliquam vitae sapien a leo pulvinar maximus.
					<br />
					<br />
					Donec tristique viverra lorem at tincidunt. Integer gravida
					tincidunt mauris interdum finibus. Donec gravida neque
					auctor orci ornare, ut congue ipsum fringilla. Fusce
					molestie risus quis fermentum consequat. Nullam vitae dui
					sit amet quam maximus rhoncus. Phasellus euismod placerat
					aliquam. Donec est nisl, suscipit ac commodo non, ultricies
					quis nisl. Maecenas convallis justo porttitor leo luctus, at
					dictum felis viverra. Sed sodales quis tortor vitae
					vestibulum.
				</p>
			</div>
		</div>
	);
}

export default Welcome;
