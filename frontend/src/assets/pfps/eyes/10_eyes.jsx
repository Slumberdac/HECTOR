import * as React from "react";
const Svg10Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<path
			strokeLinecap="round"
			d="M200 130h30"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
		{"# Right Eye"}
		<path
			strokeLinecap="round"
			d="M260 110h30"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
	</svg>
);
export default Svg10Eyes;
