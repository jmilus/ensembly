import 'server-only';
import MessagesNav from './MessagesHelpers';

const MessagesPage = async (props) => {
    return (
        <div className="page-base">
            <div className="action-section">
                <MessagesNav />
            </div>
            <div className="form-section">
                {props.children}
            </div>
        </div>
    )
}

export default MessagesPage;