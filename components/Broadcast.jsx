'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import useStatus from '../hooks/useStatus';

import Composer from './Composer';
import DropContainer from './DropContainer';
import ModuleCard from './ModuleCard';
import Verify from './VerifyButton';
import ContactCollection from './ContactCollection';
import { Text } from './Vcontrols';
import TabControl, { Tab } from './TabControl';

const Broadcast = ({ broadcastId, subject, body, status, groups }) => {
    const [broadcastContent, setBroadcastContent] = useState(body);
    const [broadcastSubject, setBroadcastSubject] = useState(subject);
    const saveStatus = useStatus();
    const router = useRouter();

    // console.log({ broadcastContent }, { status });

    const dropModule = (input) => {
        console.log({ input })
        const index = input.target.index;
        const module = input.source;
        if (index === null) return;
        let newContent = [...broadcastContent]
        console.log({ broadcastContent }, index)
        newContent.splice(index, 0, { type: module.type, key: Math.random() })
        console.log(newContent.map(c => console.log(c)))
        setBroadcastContent(newContent)
    }

    const reorderModules = (index, change) => {
        if (index + change < 0 || index + change >= broadcastContent.length) return;
        let newContent = [...broadcastContent];
        newContent.splice(index + change, 0, newContent.splice(index, 1)[0])
        setBroadcastContent(newContent);
    }

    const deleteModule = (index) => {
        let newContent = [...broadcastContent]
        newContent.splice(index, 1);
        setBroadcastContent(newContent);
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
            broadcastSubject,
            broadcastContent
        })
        saveStatus.saving();
        const savedResult = await fetch('/api/messages/broadcasts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: broadcastId,
                subject: broadcastSubject,
                body: broadcastContent
            })
        })
            .then(res => res.json())
            .then(response => {
                // console.log({ response })
                if (broadcastId === 'new') {
                    router.push(`/messages/broadcasts/${response.id}`)
                }
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

    
    const renderModule = (module, index, count) => {

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
            <div key={`${index}-${module.key}`} className={`module-wrapper`} style={{ zIndex: count - index }}>
                <DropContainer
                    key={count - index}
                    caption=""
                    value={{index: index}}
                    acceptTypes={["MODULE"]}
                    dropStyles={{ baseStyle: { border: 'none', flex: 1, zIndex: 0 } }}
                    childrenStyle={{ marginTop: "auto" }}
                    dropAction={dropModule}
                >
                    <div className="module-menu button-chain column">
                        <button className="up" onClick={() => reorderModules(index, -1)}><i>arrow_upward</i></button>
                        <Verify mode="slide-right">
                            <button><i>delete</i></button>
                            <button onClick={() => deleteModule(index)} style={{["--edge-color"]:"red", color: "red", fontSize: "0.8em", height: "15px", borderRadius: "3px 0 0 3px", borderRightWidth: "0", padding: "0 3px"}}>Confirm</button>
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
            <section style={{ flex: 1, overflow: "hidden" }}>
                <article>
                    <Text id="broadcast-subject" name="subject" label="Subject" value={broadcastSubject} extraAction={(v) => setBroadcastSubject(v)} Vstyle={{ padding: "0 0 13px 0" }} />
                    <article className="broadcast-drafter" style={{ flex: 1, margin: "5px" }}>
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
                {/* <article style={{flex: 0, minWidth: "300px", padding: "5px"}}>
                    <ModuleCard module={{name: "Basic", type: "standard_paragraph"}} />
                </article> */}
                <TabControl style={{maxWidth:"300px"}}>
                    <Tab id="Addressees">
                        <ContactCollection groups={groups} />
                    </Tab>
                    <Tab id="Modules">
                        <ModuleCard module={{name: "Basic", type: "standard_paragraph"}} />
                    </Tab>
                </TabControl>
            </section>
            <section className="button-tray">
                <button className="fit" onClick={saveDraft}><i>save</i><span>Save Draft</span></button>
                <button className="fit angry" onClick={() => console.log("delete Broadcast")}><i>delete_forever</i><span>Delete Draft</span></button>
                <button className="fit happy" style={{ marginLeft: "auto" }} onClick={() => console.log("send Broadcast")}><i>send</i><span>Send Broadcast</span></button>
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