import * as React from "react";
const Svg2Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<circle cx={210} cy={130} r={4} fill="#000" />
		<path
			strokeLinecap="round"
			d="m200 110 30 20"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
		{"# Right Eye"}
		<circle cx={280} cy={100} r={4} fill="#000" />
		<path
			strokeLinecap="round"
			d="m260 110 20-30"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
	</svg>
);
export default Svg2Eyes;
