import React from 'react';
import { Text, Num, Select } from './ControlMaster';
import TextControl from './TextControl';
import SelectControl from './SelectControl';

import styles from '../styles/ProfileCard.module.css';


const ContactCard = ({ id = `new-contact-${props.type}`, name = "new", type, contact, enums, deleteMe, recordId, updateForm }) => {
    const buttons = [];


    let cardContent = null;
    switch (type) {
        case "email":
            cardContent = <Text id={`${id}-text`} name="address" label="Email" initialValue={contact?.address} recordId={recordId} updateForm={updateForm} />
            break;
        case "phone":
            cardContent = <TextControl id={`${id}-text`} name="phonenumber" type="text" initialValue={contact?.phonenumber} />
            break;
        case "address":
            cardContent =
                <>
                    <TextControl id={`${id}-street1-text`} label="Street" name="street" type="text" initialValue={contact?.street} />
                    <TextControl id={`${id}-street2-text`} label="Street 2" name="street2" type="text" initialValue={contact?.street2} />
                    <TextControl id={`${id}-city-text`} label="City" name="city" type="text" initialValue={contact?.city} />
                    <div style={{ display: 'flex' }}>
                        <TextControl id={`${id}-state-text`} label="State" name="state" type="text" initialValue={contact?.state} />
                        <TextControl id={`${id}-postalCode-text`} label="Zip" name="postalCode" type="text" inheritedStyles={{ width: '5em' }} initialValue={contact?.postalCode} />
                    </div>
                </>
            break;
        default:
            cardContent = <div>Control not Provisioned</div>
    }

    if (contact) {
        let deleteButton = <i key="delete" className="btn" onClick={() => deleteMe(recordId)}>delete</i>
        if (contact?.rank === "Primary") {
            deleteButton = <i key="delete" className="btn disabled">delete</i>
        }
        buttons.push(deleteButton);
    }

    return (
        <object className={styles.cardContainer}>
            <div className={styles.cardControls}>
                <Select id={`${id}-rank`} name="rank" initialValue={contact?.rank} options={enums} tiny recordId={recordId} updateForm={updateForm} />
                <div className="button-tray">
                    {
                        buttons.map(button => button)
                    }
                </div>
            </div>
            <div className={styles.cardContent}>
                {cardContent}
            </div>
        </object>
    )
}

export default ContactCard;