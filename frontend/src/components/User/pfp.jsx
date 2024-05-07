import React from "react";

import "./Pfp.css";
import Head from "../../assets/pfps/head";
import { eyes, mouths } from "../../assets/pfps/index";

function GenerateProfilePicture(props) {
	const Eyes = eyes[props.eye - 1];
	const Mouth = mouths[props.mouth - 1];

	console.log(Eyes);
	console.log(Mouth);

	{
		/* Template Sizes */
	}
	return (
		<div className="pfp">
			{/* // Eyes */}
			<Eyes style={{ position: "absolute", zIndex: 2 }} />
			{/* // Mouth */}
			<Mouth style={{ position: "absolute", zIndex: 2 }} />
			{/* // Head */}
			<Head
				color={props.color}
				style={{ position: "absolute", zIndex: 1 }}
			/>
		</div>
	);
}

export default GenerateProfilePicture;
