import * as React from "react";
const Svg11Eyes = (props) => (
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
			strokeWidth={3}
			d="M220 90c0 10 5 20 15 20M235 110c-10 0-15 10-15 20M220 130c0-10-5-20-15-20M205 110c10 0 15-10 15-20"
		/>
		{"# Right Eye"}
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={3}
			d="M270 80c0 10 5 20 15 20M285 100c-10 0-15 10-15 20M270 120c0-10-5-20-15-20M255 100c10 0 15-10 15-20"
		/>
	</svg>
);
export default Svg11Eyes;
