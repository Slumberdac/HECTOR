import * as React from "react";
const Svg6Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<path
			strokeLinecap="round"
			d="m200 140 10-20M210 120l10 20"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
		{"# Right Eye"}
		<path
			strokeLinecap="round"
			d="m270 110 10-20M280 90l10 20"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
	</svg>
);
export default Svg6Eyes;
