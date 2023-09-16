import 'server-only';

import SubNav from 'components/SubNav';

const navNodes = [
    { caption: "Forum", route: "/forum"},
    { caption: "Broadcasts", route: "/broadcasts" },
    { caption: "Surveys", route: "/surveys" }
]

const MessagesPage = async (props) => {
    return (
        <div className="page-base">
            <div className="action-section">
                <SubNav caption="Messaging" root="messages" navNodes={navNodes} />
            </div>
            <div className="form-section">
                {props.children}
            </div>
        </div>
    )
}

export default MessagesPage;