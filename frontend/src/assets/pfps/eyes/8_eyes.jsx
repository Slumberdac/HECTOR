import * as React from "react";
const Svg8Eyes = (props) => (
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
			d="M200 120h20"
		/>
		{"# Right Eye"}
		<circle cx={280} cy={100} r={4} fill="#000" />
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={5}
			d="M270 90h20"
		/>
	</svg>
);
export default Svg8Eyes;
