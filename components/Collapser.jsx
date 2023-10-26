'use client'

import React, { useState } from 'react';

export default function Collapser({ id, button, type, startCollapsed=true, trigger, children, nodeHeight, hideDeadEnds, style }) {
    const [collapsed, setCollapsed] = useState(startCollapsed);

    const CollapsingHandler = (value) => {
        setCollapsed(value);
        if (trigger) trigger(value);
    }

    const nodeClickHandler = (e) => {
        // console.log(e);
        if (e.target.className.includes("expander")) CollapsingHandler(!collapsed)
    }

    const isCollapsed = collapsed ? "collapsed" : ""

    return (
        <div id={id} className={`collapser-wrapper${hideDeadEnds ? " hide-dead-ends" : ""}`} style={style}>
            <div className="collapser-node" onClickCapture={nodeClickHandler} style={{ ['--node-height']: nodeHeight }}>
                {isCollapsed
                    ? <i className="expander">expand_more</i>
                    : <i className="expander">expand_less</i>
                }
                {button}
            </div>
            <div className={`collapser-content ${isCollapsed}`}>
                {
                    children
                }
            </div>
        </div>
    )
}