'use client'

import React, { useState, useRef, useEffect } from 'react';

export default function Collapser({ id, caption, button, type, startCollapsed=true, trigger, children, nodeHeight, style, debug }) {
    const [collapsed, setCollapsed] = useState(startCollapsed);

    const CollapsingHandler = (value) => {
        console.log("collapser is collapsed:", value)
        setCollapsed(value);
        if (trigger) trigger(value);
    }

    const isCollapsed = collapsed ? "collapsed" : ""

    return (
        <div id={id} className={`collapser-wrapper`} style={style}>
            <div className="collapser-node" style={{['--node-height']: nodeHeight}}>
                {
                    button && button
                }
                <div className="collapser-caption" onClick={() => CollapsingHandler(!collapsed)}>
                    {caption}
                </div>
            </div>
            <div className={`collapser-content ${isCollapsed}`}>
                {
                    children
                }
            </div>
        </div>
    )
}