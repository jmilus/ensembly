import 'server-only'

import Modal2 from '../../components/Modal2';
import { Collection, Form, Text } from '../../components/Vcontrols';



const MessagesPage = async () => {

    return (
        <div className="page-base">
            <div className="action-section">
                <h1>Messages</h1>
                <Modal2
                    modalButton={<button><i>mail</i><span>New Announcement</span></button>}
                    title="Compose Announcement"
                >
                    <Form id="announcement-form" APIURL="" >
                        <Collection id="addressees" name="addressees" label="To:" options={[]} />
                        <Text id="body" name="body" limit={3000} />
                    </Form>
                </Modal2>
                
            </div>
            <div className="form-section">
                <div className="page-details"></div>
            </div>
        </div>
    )
}

export default MessagesPage;