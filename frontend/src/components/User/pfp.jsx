import React from 'react';

import eyes from "../assets/pfps/eyes/*.svg";
import mouths from "../assets/pfps/mouths/*.svg";
import head from "../assets/pfps/head.svg"

function GenerateProfilePicture(color, eye, mouth) {
    const SetEyes = eyes[eye + 1];
    const SetMouth = mouths[mouth + 1];

    {/* Template Sizes */}
    return (
        <svg width="200" height="200">
            {/* Background color asd*/}
            <rect width="100%" height="100%" fill={color} />
            {/* Head */}
            <image href={head} x="50" y="50" width="100" height="100" />
            {/* Eyes */}
            <image href={SetEyes} x="50" y="50" width="100" height="100" />
            {/* Mouth */}
            <image href={SetMouth} x="50" y="50" width="100" height="100" />
        </svg>
    );
}

export default GenerateProfilePicture;
