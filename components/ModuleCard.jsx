'use client'

import { useDrag } from 'react-dnd';

const ModuleCard = ({ module, cardType="MODULE", dropAction }) => {

    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: cardType,
        item: module,
        end(item, monitor) {
            const dropResult = monitor.getDropResult()
            console.log(dropResult);

            if(dropResult && dropAction) dropAction({ module: item, index: dropResult.value?.index });
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        })
    }), [dropAction])

    return (
        <div ref={drag} className={`card-container drag`} style={isDragging ? { opacity: 0.5 } : {}}>
            <div className="card-header" >
                <i style={{fontSize: "3em", color: "var(--color-p)", cursor: "inherit"}}>view_headline</i>
                <div className="card-caption">
                    <div className="card-name">{module.name}</div>
                </div>
            </div>
        </div>
    )
}

export default ModuleCard;