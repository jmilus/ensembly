'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import useStatus from '../../hooks/useStatus';

// import './Vstyling.css';

const Form = ({ id, auxData, children, APIURL, METHOD, altSubmit, subActions, followUp, followPath, onChange, auto, timeout = 1000, style, debug }) => {
    const saveTimer = useRef();
    const readOnlyInputs = useRef([]);
    const status = useStatus()

    const router = useRouter()
    const pathname = usePathname()
    const path = pathname.slice(0, pathname.includes("/$") ? pathname.indexOf("/$") : pathname.length)

    useEffect(() => {
        const thisForm = document.getElementById(id);
        const inputs = thisForm.getElementsByTagName('input')
        Object.values(inputs).forEach(input => {
            // console.log(input.name, input.readOnly);
            if (input.readOnly && input.name) readOnlyInputs.current.push(input.name)
        })
    }, [])

    const sendToJsonAPI = async (data) => {
        // console.log("form data:", data)
        const jsonData = JSON.stringify({ ...data, ...auxData })
        
        let fetchURL;
        if (APIURL) {
            fetchURL = APIURL.startsWith('/') ? APIURL : `/api${path}/${APIURL}`
        } else {
            fetchURL = `/api${path}`
        }
        

        return await fetch(fetchURL, {
            method: METHOD || 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: jsonData
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
        
        if (readOnlyInputs.current.includes(e.target.name)) return null;
        
        status.saving()


        if (e.nativeEvent.submitter?.parentElement.className.includes("modal")) router.back();

        const formElement = e.target.form ? e.target.form : e.target;
        const formData = new FormData(formElement);

        const dataObject = { ...auxData }
        const iterator = [...formData.entries()]
        console.log({ iterator })

        iterator.every(item => {
            console.log("form iterator:", item)
            let [fieldName, fieldValue] = item;
            if (readOnlyInputs.current.includes(fieldName)) return true;

            const uniqueNameDash = fieldName.indexOf("-");
            if(uniqueNameDash > 0) fieldName = fieldName.slice(0, uniqueNameDash)

            if (debug) console.log("input name and value:", { fieldName }, { fieldValue });
            if (dataObject[fieldName]) {
                if (Array.isArray(dataObject[fieldName])) {
                    dataObject[fieldName].push(fieldValue);
                } else {
                    dataObject[fieldName] = [dataObject[fieldName], fieldValue]
                }
            } else {
                dataObject[fieldName] = fieldValue;
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

        if (altSubmit) {
            altSubmit(dataObject);
            subActions?.forEach(action => {
                action(dataObject);
            })  
            return;
        }

        const {res} = await sendToJsonAPI(dataObject)
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
                    newPath = followPath.startsWith("$slug$") ? `${path}/${followPath}` : followPath;
                    newPath = newPath.replace("$slug$", res.id);
                }
                
                if (followPath.includes("$closeModal$"))
                    newPath = path.replace("/$closeModal$", "")
                
                router.push(newPath)
            }
            status.saved();
        }
        
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
        <form id={id} onSubmit={handleFormSubmit} onChange={handleFormChange} onKeyDown={handleFormKeyDown} style={style}>
            {children}
        </form>
    )
}

export default Form;