'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import useStatus from '../hooks/useStatus';

import Composer from './Composer';
import DropContainer from './DropContainer';
import ModuleCard from './ModuleCard';
import { Text } from './Vcontrols';

const Broadcast = ({ broadcastId, subject, body, status }) => {
    const [broadcastContent, setBroadcastContent] = useState(body);
    const [broadcastSubject, setBroadcastSubject] = useState(subject);
    const saveStatus = useStatus();

    console.log({ broadcastContent }, { status });

    const deleteModule = (key, e) => {
        e.preventDefault()
        console.log({ key })
        let toDeleteIndex = broadcastContent.findIndex(mod => {
            console.log({mod})
            return mod.key === key;
        })
        console.log({ toDeleteIndex })
        if (toDeleteIndex < 0) return;
        let newContent = [...broadcastContent]
        newContent.splice(toDeleteIndex, 1);
        console.log("updated new content:", newContent)
        setBroadcastContent(newContent);
    }

    const dropModule = (input) => {
        console.log({ input })
        const { index, module } = input;
        if (index === null) return;
        let newContent = [...broadcastContent]
        if (module.key) {
            let toDeleteIndex = broadcastContent.findIndex(mod => {
                return mod.key === module.key;
            })
            if (toDeleteIndex < 0) return;
            newContent.splice(toDeleteIndex, 1);
            newContent.splice(index, 0, module)
        } else {
            newContent.splice(index, 0, { type: "standard_paragraph", key: Math.random() })
        }
        console.log({newContent})
        setBroadcastContent(newContent)
    }

    const handleContentUpdate = (index, content) => {
        console.log({ index }, { content })
        let newBroadcastContent = [...broadcastContent]
        newBroadcastContent[index].content = content
        setBroadcastContent(newBroadcastContent);
    }

    const saveDraft = async () => {
        console.log({
            broadcastId,
            broadcastContent,
            status
        })
        saveStatus.saving();
        const savedResult = await fetch('/api/messages/updateBroadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: broadcastId,
                subject: broadcastSubject,
                body: broadcastContent,
                status: status
            })
        })
            .then(res => res.json())
            .then(response => {
                // console.log({ response })
                saveStatus.saved();
                return response;
            })
            .catch((err, message) => {
                saveStatus.error();
                console.error("there was a problem saving the broadcast", message);
                return err;
            })
        
        console.log({savedResult})
    }

    
    const renderModule = (module, index) => {
        const dropRef = useRef(null);
        const dragRef = useRef(null);
        const { key } = module;

        const [{ isOver }, drop] = useDrop({
            accept: "MODULE",
            drop: () => ({module, index}),
            collect: monitor => ({
                isOver: !!monitor.isOver()
            })
        })

        const [{ isDragging }, drag, dragPreview] = useDrag({
            type: "MODULE",
            item: module,
            end(item, monitor) {
                const dropResult = monitor.getDropResult()
                console.log(dropResult);

                if (dropResult) dropModule({ module: item, index: dropResult?.index });
            },
            collect: monitor => ({
                isDragging: !!monitor.isDragging(),
            })
        })

        dragPreview(drop(dropRef))
        drag(dragRef)

        // console.log({ dragRef }, { dropRef })

        // const dragButton = forwardRef((props, ref) => (
        //     <i ref={ref} {...props}>expand</i>
        // ))

        // const moduleOptions = [
        //     <i ref={dragRef}>expand</i>,
        //     <i onMouseDown={(e) => deleteModule(module.key, e)}>delete</i>
        // ]
        
        const zIndex = broadcastContent.length - index;
        const dropStyles = {
            baseStyle: { zIndex: zIndex, height: "fit-content" },
            hoverStyle: { transition: "all 0.1s ease" },
            canDropStyle: { }
        }

        let element = <></>;
        switch (module.type) {
            case 'section_divider':
                element = <SectionDivider index={index} />
                break;
            case 'standard_paragraph':
                element =
                    <ParagraphModule
                        index={index}
                        content={module.content}
                        // dropModule={dropModule}
                        status={status}
                        output={(o) => handleContentUpdate(index, o)}
                    />
                break;
            default:
                break;
        }
        // 
        return (
            <div ref={dropRef} key={`${index}-${module.key}`} className={`module-wrapper ${isOver ? "hovered" : ""}`} style={{ zIndex: zIndex }}>
                <div ref={dragRef} className="module-menu"><i>expand</i>{index}</div>
                <div className="module-dropper-box"><i>add_box</i></div>
                <div className={`module-drag-wrapper ${isDragging ? "dragging" : ""}`}>
                    {/* <div ref={dragRef} style={{height: "2em", width: "50px", background: "red"}}></div> */}
                    {element}
                </div>
            </div>
        )
    }
    
    return (
        <article>
            <section style={{ flex: 1, overflow: "hidden" }}>
                <article>
                    <Text id="broadcast-subject" name="subject" label="Subject" value={broadcastSubject} extraAction={(v) => setBroadcastSubject(v)} Vstyle={{ padding: "0 0 13px 0" }} />
                    <article className="broadcast-drafter" style={{ flex: 1 }}>
                        {
                            broadcastContent.map((module, x) => {
                                console.log("module", module.key, x);
                                return renderModule(module, x)
                            })
                        }
                        <DropContainer
                            key={broadcastContent.length}
                            caption=""
                            value={{index: broadcastContent.length}}
                            acceptTypes={["MODULE"]}
                            dropStyles={
                                {
                                    baseStyle: { border: 'none', flex: 1, minHeight: "100px", zIndex: 0 },
                                    hoverStyle: { border: '1px solid var(--color-moss'}
                                }
                            }
                        />
                    </article>
                </article>
                <article style={{flex: 0, minWidth: "300px", padding: "10px"}}>
                    <ModuleCard module={{name: "Basic"}} dropAction={dropModule} />
                </article>
            </section>
            <section>
                <button onClick={saveDraft}>Save Draft</button>
            </section>
        </article>
    )

}

export default Broadcast;

//

export const ParagraphModule = ({index, content, status, output, style}) => {
    // console.log({contents})

    return (
        <Composer
            id={`paragraph-${index}`}
            initialValue={content}
            contentOutput={output}
            readOnly={status != "DRAFT"}
            style={style}
        />
    )
}