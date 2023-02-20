import React from 'react';
import { useDrop } from 'react-dnd';

const DropContainer = ({ caption, value, acceptTypes, dropStyles, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: acceptTypes || "nothing",
        drop: () => ({value}),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    }))

    let containerStyle;
    if (dropStyles) {
        if(dropStyles.baseStyle) containerStyle = { ...dropStyles.baseStyle }
        if (canDrop && dropStyles.canDropStyle) containerStyle = { ...containerStyle, ...dropStyles.canDropStyle };
        if (isOver && dropStyles.hoverStyle) containerStyle = { ...containerStyle, ...dropStyles.hoverStyle };
    }

    return (
        <object className={`drop-container ${canDrop ? "hovered" : ""}`} ref={drop} style={containerStyle}>
            {caption && <div className="dc-name">{caption}</div>}
            {children}
        </object>
    )

}

export default DropContainer;