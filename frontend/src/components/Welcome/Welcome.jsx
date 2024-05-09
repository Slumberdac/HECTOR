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
				<img id="rocks-bg" src={Background} alt="background" />
			</div>
			<div className="welcome-logo">
				<h1>Welcome to</h1>
				{/* when scrollY reaches 80, slide logo up and fade in some text */}
				<Logo
					color="#050604"
					style={{
						transform: `translateY(${scrollY > 80 ? "-10%" : "0"})`,
						transition: "transform 1.5s ease-out",
					}}
				/>
				<p
					className="logo-text"
					style={{
						// fade in text
						opacity: `${scrollY > 80 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					<span className="cap">H</span>
					ector's
					<span className="cap">E</span>
					xtravagant
					<span className="cap">C</span>
					ontainement
					<span className="cap" style={{ marginRight: "-15px" }}>
						T
					</span>
					errain
					<span className="cap">O</span>f
					<span className="cap">R</span>
					ocks
				</p>
				<p
					id="number-1"
					style={{
						// fade in text
						opacity: `${scrollY > 80 ? "1" : "0"}`,
						transition: "opacity 1s",
					}}
				>
					The World's #1 Pet Rock Registry
				</p>
			</div>
			<div style={{ height: "100px" }}></div>
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
