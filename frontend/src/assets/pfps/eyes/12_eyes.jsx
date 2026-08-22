import * as React from "react";
const Svg12Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={5}
			d="M220 90c20 20-5 0 15 20M235 110c-20 20 5 0-15 20M220 130c-20-20 5 0-15-20M205 110c20-20-5 0 15-20"
		/>
		{"# Right Eye"}
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={5}
			d="M270 80c20 20-5 0 15 20M285 100c-20 20 5 0-15 20M270 120c-20-20 5 0-15-20M255 100c20-20-5 0 15-20"
		/>
	</svg>
);
export default Svg12Eyes;
