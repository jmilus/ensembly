'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import TabControl, { Tab } from "../../components/TabControl";
import { Form, Collection, Text } from '../../components/Vcontrols';
import ModalButton from '../../components/ModalButton';

export const BroadcastBox = ({info}) => {
    const { id, subject, date, type } = info;
    const router = useRouter();
    return (
        <div id={id} className="broadcast-container" onClick={() => router.push(`/messages/broadcasts/${id}`)}>
            {subject}
        </div>
    )
}

const MessagesNav = () => {
    const [route, setRoute] = useState("")
    const router = useRouter();

    useEffect(() => {
        router.push(`/messages/${route}`);
    }, [route])

    let routeName = "Messages";
    switch (route) {
        case "":
            routeName = "Message Board";
            break;
        case "broadcasts":
            routeName = "Broadcasts";
            break;
        case "surveys":
            routeName = "Surveys";
            break;
        case "previewing":
            routeName = "Previewing";
            break;
        default:
            break;
    }
    
    return (
        <div className="sub-nav">
            <article style={{ padding: "10px", flex: "0 0 10em" }}>
                <h1>{routeName}</h1>
            </article>
            <TabControl type="accordion">
                <Tab id="Message Board" onLoad={() => setRoute('')}>
                    <article style={{ padding: "10px" }}>
                        <ModalButton
                            modalButton={<><i>mail</i><span>New Announcement</span></>}
                            title="Compose Announcement"
                        >
                            <Form id="announcement-form" APIURL="" >
                                <Collection id="addressees" name="addressees" label="To:" options={[]} />
                                <Text id="body" name="body" limit={3000} />
                            </Form>
                        </ModalButton>
                    </article>
                </Tab>
                <Tab id="Broadcasts" onLoad={() => setRoute('broadcasts')}>
                    <article style={{ padding: "10px" }}>
                    <ModalButton
                        modalButton={<><i>mail</i><span>Create New Broadcast</span></>}
                        title="New Broadcast"
                    >
                        <article className="modal-fields">
                            <Text id="new-broadcast" name="subject" label="Subject" />
                        </article>
                        <section className="modal-buttons">
                            <button name="submit">Create Draft</button>
                        </section>
                    </ModalButton>
                    </article>
                </Tab>
                <Tab id="Surveys" onLoad={() => setRoute('surveys')}>

                </Tab>
                <Tab id="Preview" onLoad={() => setRoute('previewing')}></Tab>
            </TabControl>
        </div>
    )
}

export default MessagesNav;