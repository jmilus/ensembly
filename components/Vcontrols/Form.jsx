'use client'

import { useRouter } from 'next/navigation';
import { useRef, useEffect, useContext } from 'react';
import useStatus from '../../hooks/useStatus';

import { GlobalContext } from '../ContextFrame';

import './Vstyling.css';

const Form = ({ id, recordId, additionalIds, children, APIURL, altSubmit, subActions, followUp, followPath, onChange, auto, timeout = 1000, debug }) => {
    const saveTimer = useRef();
    const readOnlyInputs = useRef([]);
    const { dispatch } = useContext(GlobalContext);
    const status = useStatus()

    const router = useRouter()

    useEffect(() => {
        const thisForm = document.getElementById(id);
        const inputs = thisForm.getElementsByTagName('input')
        Object.values(inputs).forEach(input => {
            // console.log(input.name, input.readOnly);
            if (input.readOnly && input.name) readOnlyInputs.current.push(input.name)
        })
    }, [])

    const sendToJsonAPI = async (data) => {
        const jsonData = JSON.stringify({...data, id: recordId, ...additionalIds})
        return await fetch(`/api${APIURL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonData
        })
            .then(response => response.json())
            .then(record => {
                console.log({ record });
                return record;
            })
            .catch((err, message) => {
                console.error("failed to update record...", message);
                return err;
            })
        
        
    }

    const sendToFileAPI = async (data) => {
        return await fetch(`/api${APIURL}`, {
            method: 'PUT',
            body: data
        })
            .then(response => response.json())
            .then(result => {
                console.log("file successfully uploaded");
                return result;
            })
            .catch((err, message) => {
                console.error("file upload failed,", message)
                return err;
            })
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (debug) console.log("form submit event", e);
        status.saving()

        if (readOnlyInputs.current.includes(e.target.name)) return null;

        // if (e.nativeEvent.submitter && e.nativeEvent.submitter.name != "submit") {

        //     switch (e.nativeEvent.submitter.name) {
        //         case "cancel":
        //         default:
        //             dispatch({
        //                 route: "modal",
        //                 payload: {type: "hide"}
        //             })
        //             return null;
        //     }
        // }

        if (e.nativeEvent.submitter) {
            dispatch({
                route: "modal",
                payload: {type: "hide"}
            })

        }

        const formElement = e.target.form ? e.target.form : e.target;
        const formData = new FormData(formElement);

        const dataObject = { id: recordId, ...additionalIds }
        const iterator = [...formData.entries()]

        iterator.every(item => {
            if (readOnlyInputs.current.includes(item[0])) return true;

            const uniqueNameDash = item[0].indexOf("-");
            const key = uniqueNameDash > 0 ? item[0].slice(0, uniqueNameDash) : item[0];
            const val = item[1];
            if (debug) console.log("input value:", { key }, { val });
            if (dataObject[key]) {
                if (Array.isArray(dataObject[key])) {
                    dataObject[key].push(val);
                } else {
                    dataObject[key] = [dataObject[key], val]
                }
            } else {
                dataObject[key] = val;
            }
            return true;
        })

        const fileInput = Object.values(formElement).find(thing => thing.type === "file")
        if (fileInput) {
            const files = fileInput.files;
            console.log({files})
            dataObject.files = files;
        }

        if (debug) console.log("processed form data:", dataObject);

        if (APIURL) {
            let APIResponse = await sendToJsonAPI(dataObject)

            console.log({ APIResponse });

            if (APIResponse[0]?.err) {
                console.error(err);
            } else {
                status.saved();
                if (followUp) followUp(APIResponse);
                if (followPath) {
                    router.push(followPath(APIResponse))
                } else {
                    router.refresh();

                }
            }
            
        }  

        if (altSubmit) altSubmit(dataObject);

        subActions?.forEach(action => {
            action(dataObject);
        })        
        
    }

    const handleFormChange = (e) => {
        if (onChange) onChange(e);

        if (!auto) return null
        
        if (saveTimer.current) {
            clearTimeout(saveTimer.current);
            saveTimer.current = null;
        }

        saveTimer.current = setTimeout(() => handleFormSubmit(e), timeout);
    }

    const handleFormKeyDown = (e) => {
        if(debug) console.log("form keyDown", e)
    }

    return (
        <form id={id} onSubmit={handleFormSubmit} onChange={handleFormChange} onKeyDown={handleFormKeyDown}>
            {children}
        </form>
    )
}

export default Form;