import React from "react";

import "./Pfp.css";
import Head from "../../assets/pfps/head";
import { eyes, mouths } from "../../assets/pfps/index";

const GenerateProfilePicture = (props) => {
	const Eyes = eyes[props.eyes - 1];
	const Mouth = mouths[props.mouth - 1];

	{
		/* Template Sizes */
	}
	return (
		<div className="pfp">
			{/* // Head */}
			<Head color={props.color} />
			{/* // Eyes */}
			<Eyes />
			{/* // Mouth */}
			<Mouth />
		</div>
	);
};

export default GenerateProfilePicture;
