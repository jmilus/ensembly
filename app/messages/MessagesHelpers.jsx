'use client'

import { usePathname, useRouter } from 'next/navigation';

import TabControl, { Tab } from "../../components/TabControl";
import { Form, Collection, Text } from '../../components/Vcontrols';
import ModalButton from '../../components/ModalButton';
import Link from 'next/link';

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
    const router = useRouter();
    const path = usePathname();

    let startTab;
    let pathSegments = path.split("/")
    let messagesRoute = pathSegments[pathSegments.indexOf("messages") + 1];
    console.log({messagesRoute})
    switch (messagesRoute) {
        case "broadcasts":
            startTab = 1;
            break;
        case "surveys":
            startTab = 2;
            break;
        default:
            startTab = 0;
            break;
    }
    
    return (
        <div className="sub-nav">
            <article style={{ padding: "10px", flex: "0 0 10em" }}>
                <h1>{messagesRoute || "Forum"}</h1>
            </article>
            <TabControl type="accordion" startTab={startTab}>
                <Tab id="Message Board" onLoad={() => router.push('/messages')}>
                    <article style={{ padding: "10px" }}>
                        <ModalButton
                            title="Create Annoouncement"
                            modalButton={<><i>mail</i><span>Create</span></>}
                            buttonClass="fat"
                        >

                        </ModalButton>
                    </article>
                </Tab>
                <Tab id="Broadcasts" onLoad={() => router.push('/messages/broadcasts')}>
                    <article style={{ padding: "10px" }}>
                        <ModalButton
                            title="Create Broadcast"
                            modalButton={<><i>mail</i><span>Create</span></>}
                            buttonClass="fat"
                        >

                        </ModalButton>
                    
                    </article>
                </Tab>
                <Tab id="Surveys" onLoad={() => router.push('/messages/surveys')}>

                </Tab>
                {/* <Tab id="Preview" onLoad={() => router.push('/messages/previewing')}></Tab> */}
            </TabControl>
        </div>
    )
}

export default MessagesNav;