import React, { useEffect, useState, useRef } from "react";

import "./FishLog.scss";


export function FishLog(props) {
    const ref = useRef()
    let style = {};
    if(!props.showFishLog) {
        style = { transform: `translate(${ window.innerWidth }px, 0px)` }
    } else if(ref.current) {
        const xPosition = window.innerWidth - ref.current.getBoundingClientRect().width;
        style = { transform: `translate(${ xPosition }px, 0px)` }
    }

    return <div ref={ ref } className="fish-log" style={ style }>
        { props.addedStories.map(s => <FishLogItem key={ s.id } { ...s } />) }
    </div>
}

function FishLogItem(props) {
    return <div className="fish-log-item">
        { `${ props.index + 1 }. ${ props.title }` }
    </div>
}
