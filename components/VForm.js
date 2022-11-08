import React from 'react';
import { useRef, useContext } from 'react';
import { GlobalContext } from "../pages/_app";

const VForm = ({ id, APIURL, recordId, linkedId=null, timeout = 3000, manual, subActions, followUp, debug, children }) => {
    const formData = useRef({});
    const saveTimer = useRef();
    const { dispatch, parameters } = useContext(GlobalContext);

    const sendToAPI = async (formData) => {
        if (debug) console.log(id, { formData });
        const updatedRecord = await fetch(`/api${APIURL}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(record => {
                console.log({ record });
                return record;
            })
            .catch((err, message) => {
                console.error('Could not update record...', message);
                return err;
            })
    
        return updatedRecord;
    }

    const handleFormUpdate = async (formData) => {
        if (debug) console.log("form data:", formData);
        //
        const apiResponse = await Promise.all(Object.keys(formData).map(async record => {
            const dataItem = {
                ...formData[record],
                id: record,
                linkedId: linkedId
            }
            return await sendToAPI(dataItem);
        }))
        if (followUp) {
            console.log("followUp:", {apiResponse})
            followUp(apiResponse);
        }
    }

    const autoSave = () => {
        if (debug) console.log({ formData })
        if (saveTimer.current) {
            clearTimeout(saveTimer.current);
            saveTimer.current = null;
        }
        saveTimer.current = setTimeout(() => handleFormUpdate(formData.current, APIURL, recordId, linkedId), timeout);
    }
    const manualSave = () => {
        dispatch({
            type: "modal",
            payload: {
                type: "hide"
            }
        })
        if (debug) console.log({ formData })
        subActions?.forEach(action => {
            console.log(action);
            action();
        })
        handleFormUpdate(formData.current, APIURL, recordId, linkedId);
    }

    const updateForm = (input, propsRecordId) => {
        const thisRecordId = propsRecordId ? propsRecordId : recordId;
        const recordObj = formData.current[thisRecordId] ? formData.current[thisRecordId] : {};
        const newObj = { ...recordObj, ...input };
        formData.current[thisRecordId] = newObj;
        if (!manual) autoSave();
    }

    const bindControlToForm = (children) => {
        if (debug) console.log(`${id} binding`, { children });
        const newChildren = React.Children.map(children, child => {
            if (debug) console.log(`scanning ${child.props?.name}`, { child });
            if (child.props?.APIURL) return child;

            let grandChildren = null;
            if (child.props?.children) {
                if (typeof child.props.children === 'object') {
                    grandChildren = bindControlToForm(child.props.children);
                } else {
                    grandChildren = child.props.children;
                }
            }
            
            if (child.props.name === "submit") return React.cloneElement(child, { onClick: manualSave }, grandChildren);

            if (child.props.name) return React.cloneElement(child, { updateForm: updateForm }, grandChildren);
            
            return React.cloneElement(child, {}, grandChildren);
        })
        
        return newChildren;
    }

    const newChildren = bindControlToForm(children);

    // if (manual) {
    //     const controls = <section id={`${id}-controls`} className="modal-controls">
    //         <button name="submit" className="panel" onClick={() => manualSave()}>Submit</button>
    //     </section>
    //     newChildren.push(controls);
    // }
      
    return (
        <object name={`vform-${id}`} className="vform">
            {newChildren}
        </object>
    );
}

export default VForm;