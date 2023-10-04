'use client'

import React, { useState, useEffect } from 'react';

import useStatus from 'hooks/useStatus';
import { deduper, validateEmail } from 'utils'; // content

import { CheckBox, Select, Text } from 'components/Vcontrols';
import TabControl, { Tab } from 'components/TabControl';
import Collapser from 'components/Collapser';
import FilterContainer from 'components/FilterContainer';

const Addresser = ({ to_address=[], cc_address=[], bcc_address=[], mailgroups }) => {
    const [toList, setToList] = useState(to_address)
    const [ccList, setCcList] = useState(cc_address)
    const [bccList, setBccList] = useState(bcc_address)
    const saveStatus = useStatus();
    const contactNodeHeight = "22px";

    useEffect(() => {
        if (toList === to_address &&
            ccList === cc_address &&
            bccList === bcc_address)
        {
            
        } else {
            saveStatus.unsaved(undefined, {to_address: toList, cc_address: ccList, bcc_address: bccList})
        }
    }, [toList, ccList, bccList])

    const handleCcList = (list) => { // ADDRESSER
        const commaSeparated = list.split(",")
        let ccList = commaSeparated.map(cs => cs.trim())

        setCcList(deduper(ccList));
    }

    const handleBccList = (list) => { // ADDRESSER
        const commaSeparated = list.split(",")
        let bccList = commaSeparated.map(cs => cs.trim())

        setBccList(deduper(bccList));
    }


    const getAllEmailsInGroup = (group) => { // ADDRESSER
        const memberList = [];

        if (group.members) {
            Object.values(group.members).forEach(member => memberList.push(member.email))
        }

        let childMembers = [];
        if (group.children) {
            childMembers = Object.values(group.children).map(sd => {
                return getAllEmailsInGroup(sd);
            }).flat()
        }

        return memberList.concat(childMembers);
    }

    const amIChecked = (group) => { // ADDRESSER
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

    const toggleMembersAsContact = (emails, add) => { // ADDRESSER
        console.log("what's happening:", emails, add)
        let newContactsList;
        
        if (add) {
            newContactsList = [ ...toList, ...emails]
        } else {
            newContactsList = toList.filter(contact => !emails.includes(contact))
        }
        setToList(newContactsList)
    }

    const toggleGroupAsContacts = (group, checked) => { // ADDRESSER
        const groupEmails = getAllEmailsInGroup(group)
        console.log("members in group:", groupEmails)
        let newChecked = true;
        if (checked === "all") {
            newChecked = false;
        }
        toggleMembersAsContact(groupEmails, newChecked);
    }

    const generateContactCollapsers = (set) => { // ADDRESSER
        return Object.values(set).map((item, i) => {
            const groupChecked = amIChecked(item);
            let eCheckIcon = "check_box_outline_blank"
            if (groupChecked === "all") eCheckIcon = "check_box";
            if (groupChecked === "some") eCheckIcon = "indeterminate_check_box"
            const contactCollapserButton = <>
                <i className={`${groupChecked}`} onClick={() => toggleGroupAsContacts(item, groupChecked)}>
                    {eCheckIcon}
                </i>
                <span className="expander" style={{flex:1}}>{item.name}</span>
            </>
            let divMembers;
            let divChildren;
            if (item.members) {
                divMembers = Object.values(item.members).map((member, m) => {
                    const checkState = toList.includes(member.email);
                    return (
                        <div key={m} className={`collapser-node terminus${checkState ? " checked" : ""}`} onClick={() => toggleMembersAsContact([member.email], !checkState)} style={{['--node-height']: contactNodeHeight}}>
                            <i className={`${checkState ? "all" : "none"}`}>{checkState ? "check_box" : "check_box_outline_blank"}</i><span>{member.name}</span>
                        </div>
                    )
                })
            }
            if (item.children) {
                divChildren = generateContactCollapsers(item.children);
            }
            return (
                <Collapser
                    key={i}
                    button={contactCollapserButton}
                    nodeHeight="20px"
                    hideDeadEnds
                    startCollapsed={groupChecked === "none"}
                >
                    {divChildren}
                    {divMembers}
                </Collapser>
            )
        })

    }

    const contactCollapsers = generateContactCollapsers(mailgroups.children);
    const allMemberEmails = deduper(getAllEmailsInGroup(mailgroups));
    
    return (
        <article>
            <Select id="maillist-preset-select" label="Maillists" options={["Standard Group", "Board", "Save As New"]} extraAction={(v) => console.log("preset selected:", v)} />
            <TabControl >
                <Tab tabName="To">
                    <article>
                        {contactCollapsers}
                    </article>
                </Tab>
                <Tab tabName="CC">
                    <article>
                        <Text id="cc-list" name="cc-list" label="cc" value={ccList.join(", ")} limit={2000} extraAction={(v) => handleCcList(v)} style={{ flex: 1 }} />
                        <Text id="bcc-list" name="bcc-list" label="bcc" value={bccList.join(", ")} limit={2000} extraAction={(v) => handleBccList(v)} style={{flex:1}} />
                    </article>
                </Tab>
                <Tab tabName="All">
                    <FilterContainer
                        id="cc-filter"
                        filterTag="contact"
                        search={{ label: "contact", searchProp: "email" }}
                        columns={{ count: 1, width: "1fr" }}
                        rows="auto"
                    >
                        <span>To:</span>
                        {
                            allMemberEmails.map((contact, c) => {
                                return <CheckBox key={c} email={contact} label={contact} value={toList.includes(contact)} extraAction={(v) => toggleMembersAsContact([contact], v)} />
                            })
                        }
                        {ccList.length > 0 &&
                            <>
                                <span>Cc:</span>
                                {
                                ccList.map((contact, c) => {
                                    console.log("validate:", contact, validateEmail(contact))
                                    if (!validateEmail(contact)) return;
                                    return <CheckBox key={c} email={contact} label={contact} value={true} extraAction={() => setCcList(ccList.filter(cc => cc != contact))} />
                                })
                                }
                            </>
                        }
                        {bccList.length > 0 &&
                            <>
                                <span>Bcc:</span>
                                {
                                bccList.map((contact, c) => {
                                    if (!validateEmail(contact)) return;
                                    return <CheckBox key={c} email={contact} label={contact} value={true} extraAction={() => setBccList(bccList.filter(bcc => bcc != contact))} />
                                })
                                }
                            </>
                        }
                    </FilterContainer>
                </Tab>
            </TabControl>
        </article>
    )
}

export default Addresser;