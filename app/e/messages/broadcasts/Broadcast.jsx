'use client'

import React, { useState, useEffect } from 'react';

import useStatus from 'hooks/useStatus';

import Composer from 'components/Composer';
import DropContainer from 'components/DropContainer';
import Verify from 'components/VerifyButton';
import { Text } from 'components/Vcontrols';

const Broadcast = ({ body=[], subject="", status }) => {
    const [broadcastContent, setBroadcastContent] = useState(body);
    const [broadcastSubject, setBroadcastSubject] = useState(subject);
    const saveStatus = useStatus();

    useEffect(() => { // COMPOSER
        if (broadcastContent === body && broadcastSubject === subject)
        {
            
        } else {
            saveStatus.unsaved({payload: {body: broadcastContent, subject: broadcastSubject}, followPath: `/e/messages/broadcasts/$slug$`})
        }
    }, [broadcastContent, broadcastSubject])

    const handleContentUpdate = (index, content) => { //COMPOSER
        console.log({ index }, { content })
        let newBroadcastContent = [...broadcastContent]
        newBroadcastContent[index].content = content
        setBroadcastContent(newBroadcastContent);
    }

    const dropModule = (input) => { // COMPOSER
        const index = input.target.index;
        const myModule = input.source;
        if (index === null) return;
        let newContent = [...broadcastContent]
        newContent.splice(index, 0, { type: myModule.type, key: Math.random() })
        setBroadcastContent(newContent)
    }

    const reorderModules = (index, change) => { // COMPOSER
        if (index + change < 0 || index + change >= broadcastContent.length) return;
        let newContent = [...broadcastContent];
        newContent.splice(index + change, 0, newContent.splice(index, 1)[0])
        setBroadcastContent(newContent);
    }

    const deleteModule = (index) => { // COMPOSER
        let newContent = [...broadcastContent]
        newContent.splice(index, 1);
        setBroadcastContent(newContent);
    }

    const renderModule = (module, index, count) => { // COMPOSER

        let element = <></>;
        switch (module.type) {
            case 'section_divider':
                // element = <SectionDivider index={index} />
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
            <div key={`${index}-${module.key}`} className={`module-wrapper`} >
                <DropContainer
                    key={count - index}
                    caption=""
                    value={{ index: index }}
                    acceptTypes={["MODULE"]}
                    dropStyles={{ baseStyle: { border: 'none', flex: 1, zIndex: 0 } }}
                    childrenStyle={{ marginTop: "auto" }}
                    dropAction={dropModule}
                >
                    <div className="module-menu button-chain column">
                        <button className="up" onClick={() => reorderModules(index, -1)}><i>arrow_upward</i></button>
                        <Verify mode="slide-right">
                            <button><i>delete</i></button>
                            <button onClick={() => deleteModule(index)} style={{ ["--edge-color"]: "red", color: "red", fontSize: "0.8em", height: "15px", borderRadius: "3px 0 0 3px", borderRightWidth: "0", padding: "0 3px" }}>Confirm</button>
                        </Verify>
                        <button className="down" onClick={() => reorderModules(index, 1)}><i>arrow_downward</i></button>
                    </div>
                    <div className="module-dropper-box"><i>add_box</i></div>
                    {element}
                </DropContainer>
            </div>
        )
    }
    
    return (
        <article>
            <Text id="broadcast-subject" name="subject" label="Subject" value={broadcastSubject} extraAction={(v) => setBroadcastSubject(v)} style={{ fontSize: "18px" }} />
            <article id="broadcast-drafter" style={{ flex: 1 }}>
                {
                    broadcastContent.map((module, x) => {
                        // console.log("module", module.key, x);
                        return renderModule(module, x, broadcastContent.length)
                    })
                }
                <DropContainer
                    key={broadcastContent.length}
                    caption=""
                    value={{index: broadcastContent.length}}
                    acceptTypes={["MODULE"]}
                    dropAction={dropModule}
                    dropStyles={
                        {
                            baseStyle: { border: 'none', flex: 1, minHeight: "100px", zIndex: 0 }
                        }
                    }
                >
                    <div className="module-dropper-box"><i>add_box</i></div>
                </DropContainer>
            </article>
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

