import 'server-only';

import SubNav from 'components/SubNav';
import Link from 'next/link';

const navNodes = [
    { caption: "Forum", route: "/forum"},
    { caption: "Broadcasts", route: "/broadcasts" },
    { caption: "Surveys", route: "/surveys" }
]

const buttons = {
    broadcasts: [<Link key="0" href="/e/messages/broadcasts/new-broadcast"><button className="fit"><i>add</i><span>Create New Broadcast</span></button></Link>]
}

const MessagesPage = async (props) => {
    return (
        <div className="page-base">
            <div className="action-section">
                <SubNav caption="Messaging" root="messages" navNodes={navNodes} buttons={buttons} />
            </div>
            <div className="form-section">
                {props.children}
            </div>
        </div>
    )
}

export default MessagesPage;