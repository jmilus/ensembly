import 'server-only';
import MessagesNav from './MessagesHelpers';

const MessagesPage = async (context) => {
    return (
        <div className="page-base">
            <div className="action-section">
                <MessagesNav />
            </div>
            <div className="form-section">
                {context.children}
            </div>
        </div>
    )
}

export default MessagesPage;