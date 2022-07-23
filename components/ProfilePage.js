import { useEffect, useState, useRef } from 'react';
import useAutoSaveForm from '../../hooks/useAutoSaveForm';

import Link from 'next/link';
import TextControl from '../../components/TextControl';
import { Children } from 'react/cjs/react.production.min';

import { GlobalContext } from "../_app";
import { deleteRecord, handleFormUpdate } from '../../utils/';

import styles from '../../styles/memberProfile.module.css';

const ProfilePage = ({ entity, updateEntity, formSaved }) => {
    const saveTimer = useRef(null);

    const { autoSaveDelay } = useAutoSaveForm;

    const saveFormOnChange = (e) => {
        setSaved(false);
        autoSaveDelay(e)
    }

    const { name } = entity;

    return (
        <div className={styles.profilePage}>
            <div className={styles.dataSection}>
                <div className={styles.profileHeader}>
                    <form id="memberName" name="memberName" onSubmit={(e) => updateEntity(e)} onChange={(e) => saveFormOnChange(e)}>
                        <TextControl id="name" name="name" type="text" initialValue={name} hero isRequired/>
                    </form>
                </div>
                <div className={styles.profileDetails}>
                    <Children />
                </div>
            </div>
            <div className={styles.actionSection}>
                <Link href="/members"><button className="icon-and-label"><i>arrow_back</i>Back to Members</button></Link>
                <button type="submit" className="icon-and-label" onClick={() => document.forms["profile"].requestSubmit()}><i>save</i>Save</button>
            </div>
        </div>

    )
    
}

export default ProfilePage;