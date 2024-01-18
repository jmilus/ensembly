'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import useStatus from '../../hooks/useStatus';

// import './Vstyling.css';

const Form = ({ id, auxData, children, APIURL, METHOD, altSubmit, subActions, followUp, followPath, onChange, auto, json, timeout = 1000, style, debug }) => {
    const saveTimer = useRef();
    const readOnlyInputs = useRef([]);
    const thisForm = useRef()
    const status = useStatus()

    const router = useRouter()
    const pathname = usePathname()
    const path = pathname.replace("/e/", "/api/");
    // console.log("form path:", path)
    // const path = pathname.slice(0, pathname.includes("/$") ? pathname.indexOf("/$") : pathname.length)

    useEffect(() => {
        const inputs = thisForm.current.getElementsByTagName('input')
        Object.values(inputs).forEach(input => {
            // console.log(input.name, input.readOnly);
            if (input.readOnly && input.name) readOnlyInputs.current.push(input.name)
        })
    }, [])

    const sendToAPI = async (data) => {
        if (debug) json ? console.log(`jsonData: ${data}`) : data.forEach((value, key) => console.log(`key: ${key}, value: ${value}`))
        
        const fetchURL = APIURL ? APIURL : path;

        if (debug) console.log({fetchURL})

        return await fetch(fetchURL, {
            method: METHOD || 'PUT',
            headers: json ? { 'Content-Type': 'applicaiton/json' } : {},
            body: json ? JSON.stringify(data) : data
        })
            .then(response => response.json())
            .then(res => {
                if (res.error) throw res.error;
                return res;
            })
            .catch(error => {
                console.error("failed to update record...", error);
                return Error(error);
            })
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (debug) console.log("form submit event", e);
        
        if (readOnlyInputs.current.includes(e.target.name)) return null;

        const formData = new FormData(thisForm.current);
        if (auxData) {
            Object.keys(auxData).forEach(ad => {
                let key = ad;
                let value = auxData[ad];
                if (Array.isArray(auxData[ad])) {
                    key = ad + "[]"
                    value = JSON.stringify(auxData[ad])
                }

                formData.append(key, value)
            })
        }

        if (altSubmit) {
            console.log(e.nativeEvent)
            if (Array.isArray(altSubmit)) {
                const submitIndex = e.nativeEvent.submitter.value;
                console.log("altSubmit is an Array", { submitIndex })
                altSubmit[submitIndex](formData)
            } else {
                altSubmit(formData);
                subActions?.forEach(action => {
                    action(formData);
                })  
            }
            return;
        }
        
        status.saving({})
        
        let submitResult;
        if (json) {
            const jsonData = {};
            formData.forEach((value, key) => {
                if (!Reflect.has(jsonData, key)) {
                    jsonData[key] = value;
                    return;
                }
                if (!Array.isArray(jsonData[key])) {
                    jsonData[key] = [jsonData[key]];
                }
                jsonData[key].push(value);
            });

            submitResult = await sendToAPI(jsonData);
            
        } else {
            submitResult = await sendToAPI(formData);
            
        }

        console.log({ submitResult });
        if (!submitResult) {
            status.error({caption: "response failure"});
            return;
        }

        if (submitResult instanceof Error) {
            status.error({error: submitResult})
        } else {
            if (followUp) followUp(submitResult);
            if (followPath) {
                let newPath = followPath;
                if (followPath.includes("$slug$")) {
                    newPath = newPath.replace("$slug$", submitResult.id);
                }
                
                router.push(newPath)
            }
            status.saved({});
        }
        
    }

    const handleFormChange = (e) => {
        if (onChange) onChange(e);

        if (!auto) return null

        // console.log(thisForm.current.reportValidity())

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