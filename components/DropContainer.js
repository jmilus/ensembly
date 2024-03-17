import React from 'react';
import { useDrop } from 'react-dnd';

const DropContainer = ({ caption, value, acceptTypes, dropAction, dropStyles, childrenStyle, children }) => {
    // console.log(caption, value, children)
    // console.log({ caption }, {acceptTypes})
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: acceptTypes || "nothing",
        drop: (item, monitor) => {
            const didDrop = monitor.didDrop()
            // console.log({ item }, { value }, { didDrop })
            if(!didDrop && dropAction) dropAction({source: item, target: value})
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    }), [dropAction])

    let containerStyle;
    if (dropStyles) {
        if (dropStyles.baseStyle) containerStyle = { ...dropStyles.baseStyle }
        if (canDrop && dropStyles.canDropStyle) containerStyle = { ...containerStyle, ...dropStyles.canDropStyle };
        if (isOver && dropStyles.hoverStyle) containerStyle = { ...containerStyle, ...dropStyles.hoverStyle };
    }

    return (
        <div className={`drop-container${canDrop ? " can-drop" : ""}${isOver ? " is-over" : ""}`} ref={drop} style={containerStyle}>
            {caption && <div className="dc-name">{caption}</div>}
            <div className="drop-children" style={childrenStyle}>
                {children}
            </div>
        </div>
    )

}

export default DropContainer;