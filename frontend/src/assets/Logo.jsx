import * as React from "react";
const SvgLogo = (props) => (
	<div className="logo">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="35 50 330 350"
			fill="none"
			{...props}
		>
			<path
				stroke={props.color ?? "#000"}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={16}
				d="M107.144 151.822c18.243-28.673 65.789-.928 38.258 26.7-23.674 23.748-48.185-3.443-36.593-26.7M122.974 192.302c2.179 35.888-41.676 131.867-31.61 115.259M115.677 251.155c45.844-27.646 16.637 37.641 33.191 29.292"
			/>
			<path
				stroke={props.color ?? "#000"}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={16}
				d="M123.053 212.302c21.774-5.254 39.277-15.492 57.778-25.834M354.165 160.635c-101.927 63.113-201.614 133.713-307.33 184.524"
			/>
			<path
				stroke={props.color ?? "#000"}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={16}
				d="M183.183 104.47c115.14-131.584 193.767 72.38 79.575 110.845-64.883 21.857-112.173-76.243-74.949-116.367"
			/>
			<circle cx={280} cy={100} r={4} fill={props.color ?? "#000"} />
			<circle cx={210} cy={130} r={4} fill={props.color ?? "#000"} />
			<path
				strokeLinecap="round"
				d="m230 141 50-2"
				stroke={props.color ?? "#000"}
				strokeWidth={5}
			/>
		</svg>
	</div>
);
export default SvgLogo;
