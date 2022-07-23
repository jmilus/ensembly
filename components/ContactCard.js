import useAutoSaveForm from '../hooks/useAutoSaveForm';

import TextControl from './TextControl';
import SelectControl from './SelectControl';

import styles from '../styles/ContactCard.module.css';

// const EmailCard = (id, contact) => {
//     return (
//         <TextControl id={`${id}-text`} name="address" type="text" defaultValue={contact?.address} />
//     )
// }

const ContactCard = (props) => {
    const { autoSaveDelay } = useAutoSaveForm();
    const { id = `new-contact-${props.type}`, name = "new", recordId = "null", type, contact, enums, formSubmit, deleteMe } = props;
    const buttons = [];


    const cardContent = () => {
        switch (type) {
            case "email":
                return (
                    <TextControl id={`${id}-text`} name="address" type="text" initialValue={contact?.address} />
                )
            case "phone":
                return (
                    <TextControl id={`${id}-text`} name="phonenumber" type="text" initialValue={contact?.phonenumber} />
                )
            case "address":
                return (
                    <>
                        <TextControl id={`${id}-street1-text`} label="Street" name="street" type="text" initialValue={contact?.street} />
                        <TextControl id={`${id}-street2-text`} label="Street 2" name="street2" type="text" initialValue={contact?.street2} />
                        <TextControl id={`${id}-city-text`} label="City" name="city" type="text" initialValue={contact?.city} />
                        <div style={{ display: 'flex' }}>
                            <TextControl id={`${id}-state-text`} label="State" name="state" type="text" initialValue={contact?.state} />
                            <TextControl id={`${id}-postalCode-text`} label="Zip" name="postalCode" type="text" inheritedStyles={{ width: '5em' }} initialValue={contact?.postalCode} />
                        </div>
                    </>
                )
            default:
                return (
                    <div>Control not Provisioned</div>
                )
        }
    }

    if (contact) {
        let deleteButton = <i key="delete" className="btn" onClick={() => deleteMe(recordId)}>delete</i>
        if (contact?.rank === "Primary") {
            deleteButton = <i key="delete" className="btn disabled">delete</i>
        }
        buttons.push(deleteButton);
    }

    return (
        <object className="contact-card">
            <form id={id} name={name} onSubmit={(e) => formSubmit(e, recordId)} onChange={(e) => autoSaveDelay(e)}>
                <div className={styles.contactControls}>
                    <SelectControl id={`${id}-rank`} name="rank" initialValueId={contact?.rank} options={enums} tiny />
                    <div className="button-tray">
                        {
                            buttons.map(button => button)
                        }
                    </div>
                </div>
                <div className={styles.cardContent}>
                    {cardContent()}
                </div>
            </form>
        </object>
    )
}

export default ContactCard;