import * as React from "react";
const Svg13Eyes = (props) => (
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
			d="m220 110 20 5M240 115l-20 5M220 120l-20-5M200 115l20-5"
		/>
		<circle cx={220} cy={115} r={4} fill="#000" />
		{"# Right Eye"}
		<path
			fill="transparent"
			stroke="#000"
			strokeLinecap="round"
			strokeWidth={5}
			d="m270 100 20 5M290 105l-20 5M270 110l-20-5M250 105l20-5"
		/>
		<circle cx={270} cy={105} r={4} fill="#000" />
	</svg>
);
export default Svg13Eyes;
