import * as React from "react";
const Svg3Eyes = (props) => (
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
			strokeWidth={5}
			d="M190 130c10-20 10-10 40-15"
		/>
		{"# Right Eye"}
		<circle cx={280} cy={100} r={4} fill="#000" />
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={5}
			d="M250 90c20 5 20-20 40 0"
		/>
	</svg>
);
export default Svg3Eyes;
