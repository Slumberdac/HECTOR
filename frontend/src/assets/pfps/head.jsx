import * as React from "react";
const SvgHead = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="165 52 162 176"
		{...props}
	>
		{"# Circle"}
		<path
			stroke="#000"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={16}
			fill={props.color}
			d="M183.183 104.47c115.14-131.584 193.767 72.38 79.575 110.845-64.883 21.857-112.173-76.243-74.949-116.367"
		/>
	</svg>
);
export default SvgHead;
