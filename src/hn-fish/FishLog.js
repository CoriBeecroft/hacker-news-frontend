import React, { useEffect, useState } from "react";

import "./FishLog.scss";


export function FishLog(props) {
    return <div { ...{
        className: `fish-log ${props.showFishLog ? "" : "hidden" }`
    }}>
        { props.addedStories.map(s => <FishLogItem key={ s.id } { ...s } />) }
    </div>
}

function FishLogItem(props) {
    const [ isNew, setIsNew ] = useState(true);
    useEffect(() => setIsNew(false), [])

    return <div className={ ["fish-log-item", isNew ? "new" : ""].join(" ") }>
        { `${ props.index + 1 }. ${ props.title }` }
    </div>
}
