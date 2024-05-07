import * as React from "react";
const Svg4Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<circle cx={210} cy={130} r={2} fill="#000" />
		<circle cx={210} cy={130} r={15} stroke="#000" strokeWidth={3} />
		{"# Right Eye"}
		<circle cx={280} cy={100} r={2} fill="#000" />
		<circle cx={280} cy={100} r={15} stroke="#000" strokeWidth={3} />
	</svg>
);
export default Svg4Eyes;
