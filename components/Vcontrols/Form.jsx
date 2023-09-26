'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import useStatus from '../../hooks/useStatus';

// import './Vstyling.css';

const Form = ({ id, auxData, children, APIURL, METHOD, altSubmit, subActions, followUp, followPath, onChange, auto, timeout = 1000, style, debug }) => {
    const saveTimer = useRef();
    const readOnlyInputs = useRef([]);
    const thisForm = useRef()
    const status = useStatus()

    const router = useRouter()
    const pathname = usePathname()
    const path = pathname.replace("/e/", "/");
    // console.log("form path:", path)
    // const path = pathname.slice(0, pathname.includes("/$") ? pathname.indexOf("/$") : pathname.length)

    useEffect(() => {
        const thisForm = document.getElementById(id);
        const inputs = thisForm.getElementsByTagName('input')
        Object.values(inputs).forEach(input => {
            // console.log(input.name, input.readOnly);
            if (input.readOnly && input.name) readOnlyInputs.current.push(input.name)
        })
    }, [])

    const sendToAPI = async (data) => {
        if (debug) console.log("formData:", data.entries())
        
        let fetchURL;
        if (APIURL) {
            fetchURL = APIURL.startsWith('/') ? APIURL : `/api${path}/${APIURL}`
        } else {
            fetchURL = `/api${path}`
        }

        return await fetch(fetchURL, {
            method: METHOD || 'PUT',
            body: data
        })
            .then(response => response.json())
            .then(record => {
                return record;
            })
            .catch((err, message) => {
                console.error("failed to update record...", message);
                return err;
            })
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (debug) console.log("form submit event", e);
        
        if (readOnlyInputs.current.includes(e.target.name)) return null;
        
        status.saving()

        const formElement = e.target.form ? e.target.form : e.target;
        const formData = new FormData(formElement);

        if (altSubmit) {
            altSubmit(dataObject);
            subActions?.forEach(action => {
                action(dataObject);
            })  
            return;
        }

        if (auxData) {
            Object.keys(auxData).forEach(key => {
                formData.append(key, auxData[key])
            })
        }

        const {res} = await sendToAPI(formData)
        console.log({ res });
        if (!res) {
            status.error("response failure");
            return;
        }

        if (res.err || res[0]?.err) {
            status.error()
            console.error(err);
        } else {
            if (followUp) followUp(res);
            if (followPath) {
                let newPath = followPath;
                if (followPath.includes("$slug$")) {
                    newPath = followPath.startsWith("$slug$") ? `./${path}/${followPath}` : followPath;
                    newPath = newPath.replace("$slug$", res.id);
                }
                
                router.push(newPath)
            }
            status.saved();
        }
        
    }

    const handleFormChange = (e) => {
        if (onChange) onChange(e);

        if (!auto) return null

        console.log(thisForm.current.reportValidity())

        if (!thisForm.current.reportValidity()) return null;
        
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
        <form ref={thisForm} id={id} onSubmit={handleFormSubmit} onChange={handleFormChange} onKeyDown={handleFormKeyDown} style={style}>
            {children}
        </form>
    )
}

export default Form;