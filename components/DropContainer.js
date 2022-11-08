import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';

import { ItemTypes } from '../config/constants';

const DropContainer = ({ tag, value, onDrop, children }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.CARD,
        drop: (item) => onDrop({item, tag, value}),
        collect: monitor => ({
            isOver: !!monitor.isOver()
        })
    }))

    const subDrops = [];
    const cards = [];
    React.Children.map(children, child => {
        if (child?.type.name === "DropContainer") {
            subDrops.push(child);
        } else if (child?.type.name != ""){
            cards.push(child);
        }
    })

    const subDropsNode = subDrops && <div className="subdrop-container">{subDrops}</div>

    return (
        <object className={`drop-container ${isOver ? "hovered" : ""}`} ref={drop} >
            {isOver && subDropsNode}
            {cards}
        </object>
    )

}

export default DropContainer;