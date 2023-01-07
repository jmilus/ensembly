import React from 'react';
import { useDrop } from 'react-dnd';

const DropContainer = ({ caption, value, onDrop, acceptTypes, hoverStyle, children }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: acceptTypes || "nothing",
        drop: onDrop ? (item) => onDrop({item, value}) : null,
        collect: monitor => ({
            isOver: !!monitor.isOver()
        })
    }))

    const subDrops = [];
    const dropchildren = [];
    React.Children.map(children, child => {
        if (child?.type.name === "DropContainer") {
            subDrops.push(React.cloneElement(child, {acceptTypes: acceptTypes}));
        } else if (child?.type.name != ""){
            dropchildren.push(child);
        }
    })

    const subDropsNode = subDrops && <div className="subdrop-wrapper">{subDrops}</div>

    const dropStyle = isOver ? hoverStyle : null;
    return (
        <object className={`drop-container ${isOver ? "hovered" : ""}`} ref={drop} style={dropStyle}>
            {caption && <div className="dc-name">{caption}</div>}
            {isOver && subDropsNode}
            {dropchildren}
        </object>
    )

}

export default DropContainer;