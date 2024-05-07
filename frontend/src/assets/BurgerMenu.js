import * as React from "react";
const SvgBurgerMenu = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={50}
		height={50}
		fill="currentColor"
		{...props}
	>
		<path d="M1.5 3a.5.5 0 0 0 0 1h12a.5.5 0 0 0 0-1zM1 7.5a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 0 1h-12a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 0 1h-12a.5.5 0 0 1-.5-.5" />
	</svg>
);
export default SvgBurgerMenu;
