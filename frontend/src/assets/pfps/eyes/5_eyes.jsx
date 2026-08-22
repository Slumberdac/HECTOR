import * as React from "react";
const Svg5Eyes = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Left Eye"}
		<path
			strokeLinecap="round"
			d="m200 120 20 20M200 140l20-20"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
		{"# Right Eye"}
		<path
			strokeLinecap="round"
			d="m270 90 20 20M270 110l20-20"
			style={{
				stroke: "#000",
				strokeWidth: 5,
			}}
		/>
	</svg>
);
export default Svg5Eyes;
