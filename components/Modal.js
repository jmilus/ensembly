import { useContext } from 'react';
import { ACTION_TYPES, GlobalContext } from "../pages/_app";

import { processForm } from '../utils/';

import TextControl from './TextControl';
import SelectControl from '../components/SelectControl';
import DateControl from '../components/DateControl';

import styles from '../styles/Modal.module.css'

const Modal = ({ data }) => {
    const { dispatch, state } = useContext(GlobalContext);

    const hideModal = () => {
        dispatch({
            type: ACTION_TYPES.HIDE_MODAL
        })
    }

    if (data) {
        switch (data.type) {
            case "loading":
                return (
                    <div className={styles.modalBase}>
                        <div className={styles.modalBody}>
                            <div className={styles.loading}>
                                Loading...
                            </div>
                        </div>
                        <div className={styles.modalBackdrop}></div>
                    </div>
                )
            case "error":
                return (
                    <div className={styles.modalBase}>
                        <div className={styles.modalBody}>
                            <div className={styles.error}>
                                {data.message}
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className="panel" onClick={hideModal}>OK</button>
                            </div>
                        </div>
                        <div className={styles.modalBackdrop}></div>
                    </div>
                )
            case "form":
                const submitForm = (event) => {
                    const formData = processForm(event);
                    data.submit(formData);
                }
                return (
                    <object className={styles.modalBase}>
                        <form className={styles.modalBody} onSubmit={(e) => submitForm(e)}>
                            <div className={styles.modalHeader}>{data.title}</div>
                            <div className={styles.modalFields}>
                                {
                                    data.fields.map((field, i) => {
                                        switch (field.controlType) {
                                            case "text":
                                                return <TextControl key={i} id={field.id} name={field.name} type={field.type} label={field.label} />
                                            case "date":
                                                return <DateControl key={i} id={field.id} name={field.name} type={field.type} label={field.label} />
                                            case "select":
                                                return <SelectControl key={i} id={field.id} name={field.name} type={field.type} label={field.label} options={field.options} optionKey={field.optionKey} />
                                            default:
                                                return <div>There is an error in this form tempalte</div>
                                        }
                                    })
                                }
                            </div>
                            <div className={styles.modalActions}>
                                <button type="submit" className="panel hero">Submit</button>
                                {
                                    data.actions.map((action, i) => {
                                        const buttonType = action.type ? action.type : "button";
                                        return (
                                            <button key={i} type={buttonType} className="panel" onClick={buttonAction}>{action.name}</button>
                                        )
                                    })
                                }
                                <button type="button" className="panel" onClick={hideModal}>Cancel</button>
                            </div>
                        </form>
                        <div className={styles.modalBackdrop} onClick={hideModal}></div>
                    </object>
                )
            default:
                console.log("no modal type specified");
                break;
        }
    }
    
    return null;
}

export default Modal;