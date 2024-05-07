import * as React from "react";
const Svg16Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<circle cx={210} cy={130} r={4} fill="#000" />
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={2}
			d="M200 130c0 10 20 10 20 0"
		/>
		{"# Right Eye"}
		<circle cx={280} cy={100} r={4} fill="#000" />
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={2}
			d="M270 100c0 10 20 10 20 0"
		/>
	</svg>
);
export default Svg16Eyes;
