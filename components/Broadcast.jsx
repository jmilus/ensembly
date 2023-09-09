'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { slateToHtml } from '../utils/slateToHtml';

import useStatus from '../hooks/useStatus';
import { deduper, validateEmail } from '../utils';

import Composer from './Composer';
import DropContainer from './DropContainer';
import ItemCard from './ItemCard';
import ModuleCard from './ModuleCard';
import Verify from './VerifyButton';
import { Text } from './Vcontrols';
import TabControl, { Tab } from './TabControl';
import Collapser from './Collapser';

const Broadcast = ({ broadcastId, body, subject, to_address, cc_address, bcc_address, status, mailgroups }) => {
    const [broadcastContent, setBroadcastContent] = useState(body);
    const [broadcastSubject, setBroadcastSubject] = useState(subject);
    const [toList, setToList] = useState(to_address)
    const [ccList, setCcList] = useState([])
    const [bccList, setBccList] = useState(bcc_address)
    const saveStatus = useStatus();
    const router = useRouter();
    const contactNodeHeight = "22px";

    console.log({ toList })

    useEffect(() => {
        setCcList(cc_address)
    }, [cc_address])

    const saveDraft = async () => {
        saveStatus.saving();
        const savedResult = await fetch(`/api/messages/broadcasts/${broadcastId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: broadcastId,
                subject: broadcastSubject,
                body: broadcastContent,
                to_address: toList,
                cc_address: ccList.filter(email => validateEmail(email)),
                bcc_address: bccList.filter(email => validateEmail(email))
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

    }

    const sendBroadcast = async () => {
        console.log("sending broadcast...");
        // const myHtml = slateToHtml(broadcastContent)
        // console.log({ myHtml })
        const pmResponse = await fetch(`/api/messages/broadcasts/${broadcastId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: broadcastId
            })
        })
            .then(response => response.json())
            .then(res => res)
            .catch((err, message) => {
                console.error("failed to send broadcast", err, message);
                return err;
            })
        console.log(pmResponse);
    }

    const handleBodyUpdate = (body) => {
        saveStatus.unsaved(saveDraft)
        setBroadcastContent(body)
    }

    const handleSubjectUpdate = (text) => {
        saveStatus.unsaved(saveDraft)
        setBroadcastSubject(text);
    }

    const dropModule = (input) => {
        const index = input.target.index;
        const myModule = input.source;
        if (index === null) return;
        let newContent = [...broadcastContent]
        newContent.splice(index, 0, { type: myModule.type, key: Math.random() })
        handleBodyUpdate(newContent)
    }

    const reorderModules = (index, change) => {
        if (index + change < 0 || index + change >= broadcastContent.length) return;
        let newContent = [...broadcastContent];
        newContent.splice(index + change, 0, newContent.splice(index, 1)[0])
        handleBodyUpdate(newContent);
    }

    const deleteModule = (index) => {
        let newContent = [...broadcastContent]
        newContent.splice(index, 1);
        handleBodyUpdate(newContent);
    }

    const handleContentUpdate = (index, content) => {
        // console.log({ index }, { content })
        let newBroadcastContent = [...broadcastContent]
        newBroadcastContent[index].content = content
        handleBodyUpdate(newBroadcastContent);
    }

    const handleCcList = (list) => {
        saveStatus.unsaved(saveDraft)
        const commaSeparated = list.split(",")
        let ccList = commaSeparated.map(cs => cs.trim())

        setCcList(deduper(ccList));
    }

    const handleBccList = (list) => {
        saveStatus.unsaved(saveDraft)
        const commaSeparated = list.split(",")
        let bccList = commaSeparated.map(cs => cs.trim())

        setBccList(deduper(bccList));
    }
    
    const renderModule = (module, index, count) => {

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
            <div key={`${index}-${module.key}`} className={`module-wrapper`} style={{ zIndex: count - index }}>
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

    const getAllEmailsInGroup = (group) => {
        const memberList = [];

        if (group.members) {
            Object.values(group.members).forEach(member => memberList.push(member.email))
        }

        let lineupMembers = [];
        let divisionMembers = [];
        let subDivisionMembers = [];

        if (group.lineups) {
            lineupMembers = group.lineups.map(lu => {
                return getAllEmailsInGroup(lu);
            }).flat()
        }
        if (group.divisions) {
            divisionMembers = group.divisions.map(div => {
                return getAllEmailsInGroup(div);
            }).flat()
        }
        if (group.children) {
            subDivisionMembers = Object.values(group.children).map(sd => {
                return getAllEmailsInGroup(sd);
            }).flat()
        }

        return memberList.concat(lineupMembers, divisionMembers, subDivisionMembers);
    }

    const amIChecked = (group) => {
        const groupMembers = getAllEmailsInGroup(group)

        const all = groupMembers.every(email => {
            return toList.includes(email)
        })
        if (all) return "all"

        const none = groupMembers.every(email => {
            return !toList.includes(email)
        })
        if (none) return "none"

        return "some"
    }

    const toggleMembersAsContact = (emails, add) => {
        saveStatus.unsaved(saveDraft)
        console.log("what's happening:", emails, add)
        let newContactsList;

        if (add) {
            newContactsList = [ ...toList, ...emails]
        } else {
            newContactsList = toList.filter(contact => !emails.includes(contact))
        }
        setToList(newContactsList)
    }

    const toggleGroupAsContacts = (group, checked) => {
        const groupEmails = getAllEmailsInGroup(group)
        console.log("members in group:", groupEmails)
        let newChecked = true;
        if (checked === "all") {
            newChecked = false;
        }
        toggleMembersAsContact(groupEmails, newChecked);
    }

    const divisionCollapsers = (div) => {
        const checked = amIChecked(div);
        let checkIcon = "check_box_outline_blank"
        if (checked === "all") checkIcon = "check_box";
        if (checked === "some") checkIcon = "indeterminate_check_box"
        const divKids = div.children ? Object.values(div.children).map((child, c) => divisionCollapsers(child)) : [];
        const divMembers = Object.values(div.members).map(member => {
            const checkState = toList.includes(member.email);
            return (
                <div key={member.id} className={`collapser-node terminus${checkState ? " checked" : ""}`} onClick={() => toggleMembersAsContact([member.email], !checkState)} style={{['--node-height']: contactNodeHeight}}>
                    <i className={`${checkState ? "all" : "none"}`}>{checkState ? "check_box" : "check_box_outline_blank"}</i><span>{member.name}</span>
                </div>
            )
        })
        const collapserChildren = [...divKids, ...divMembers];
        return (
            <Collapser
                key={div.id}
                id={div.id}
                button={<i className={`${checked}`} onClick={() => toggleGroupAsContacts(div, checked)}>{checkIcon}</i>}
                caption={<span>{div.name}</span>}
                nodeHeight={contactNodeHeight}
            >
                {
                    collapserChildren
                }
            </Collapser>
        )

    }


    const contactsManager =
        <div className="contacts-manager">
            {
                mailgroups.ensembles.map((ensemble, e) => {
                    const ensembleChecked = amIChecked(ensemble);
                    let eCheckIcon = "check_box_outline_blank"
                    if (ensembleChecked === "all") eCheckIcon = "check_box";
                    if (ensembleChecked === "some") eCheckIcon = "indeterminate_check_box"
                    return (
                        <Collapser
                            key={e}
                            id={`${ensemble.name}-contacts-collapser`}
                            button={<i className={`${ensembleChecked}`} onClick={() => toggleGroupAsContacts(ensemble, ensembleChecked)}>{eCheckIcon}</i>}
                            caption={<span>{ensemble.name}</span>}
                            nodeHeight={contactNodeHeight}
                            debug
                        >
                            {
                                ensemble.lineups.map((lu, l) => {
                                    const lineupChecked = amIChecked(lu);
                                    let lCheckIcon = "check_box_outline_blank"
                                    if (lineupChecked === "all") lCheckIcon = "check_box";
                                    if (lineupChecked === "some") lCheckIcon = "indeterminate_check_box"
                                    // const nestedDivisions = nester(lu.divisions, "parent_division")
                                    return (
                                        <Collapser
                                            key={`${e}-${l}`}
                                            id={`${lu.name}-contacts-collapser`}
                                            button={<i className={`${lineupChecked}`} onClick={() => toggleGroupAsContacts(lu, lineupChecked)}>{lCheckIcon}</i>}
                                            caption={<span>{lu.name}</span>}
                                            nodeHeight={contactNodeHeight}
                                        >
                                            {
                                                lu.divisions.map((div, d) => divisionCollapsers(div))
                                            }
                                        </Collapser>
                                    )
                                })
                            }
                        </Collapser>
                    )
                })
            }
        </div>
    
    return (
        <article>
            <section style={{ flex: 1, overflow: "hidden" }}>
                <article>
                    <Text id="broadcast-subject" name="subject" label="Subject" value={broadcastSubject} extraAction={(v) => handleSubjectUpdate(v)} style={{ fontSie: "18px" }} />
                    <article className="broadcast-drafter" style={{ flex: 1 }}>
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
                <TabControl type="accordion" style={{maxWidth:"300px", marginLeft: "10px"}}>
                    <Tab id="Modules">
                        {/* <ModuleCard module={{ name: "Basic", type: "standard_paragraph" }} /> */}
                        <ItemCard
                            cardType="MODULE"
                            dropItem={{ name: "Basic", type: "standard_paragraph" }}
                            itemIcon={<i style={{ fontSize: "3em", color: "var(--color-p)", cursor: "inherit" }}>view_headline</i>}
                            name="Basic"
                        />
                    </Tab>
                    <Tab id="Recipients">
                        <TabControl >
                            <Tab id="To">
                                {contactsManager}
                            </Tab>
                            <Tab id="CC">
                                <article>
                                    <Text id="cc-list" name="cc-list" label="cc" value={ccList.join(", ")} limit={2000} extraAction={(v) => handleCcList(v)} style={{ flex: 1 }} />
                                    <Text id="bcc-list" name="bcc-list" label="bcc" value={bccList.join(", ")} limit={2000} extraAction={(v) => handleBccList(v)} style={{flex:1}} />
                                </article>
                            </Tab>
                            <Tab id="All"></Tab>
                        </TabControl>
                    </Tab>
                </TabControl>
            </section>
            <section className="button-tray">
                {/* <button className="fit" onClick={saveDraft}><i>save</i><span>Save Draft</span></button> */}
                <button className="fit angry" onClick={() => console.log("delete Broadcast")}><i>delete_forever</i><span>Delete Draft</span></button>
                <button className="fit happy" style={{ marginLeft: "auto" }} onClick={() => sendBroadcast()}><i>send</i><span>Send Broadcast</span></button>
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

