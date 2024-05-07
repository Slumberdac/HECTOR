import * as React from "react";
const Svg7Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<path
			strokeLinecap="round"
			d="M210 120v20"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
		{"# Right Eye"}
		<path
			strokeLinecap="round"
			d="M280 90v20"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
	</svg>
);
export default Svg7Eyes;
