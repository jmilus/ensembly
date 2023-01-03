import React from 'react';
import { useState, useRef, useContext } from 'react';
import { GlobalContext } from "../pages/_app";

const VForm = ({ id, APIURL, recordId, additionalIds, context, timeout = 1000, manual, subActions, followUp, fileUpload, debug, children }) => {
    const vFormData = useRef({});
    const [flagRequiredFields, setFlagRequiredFields] = useState(false);
    const saveTimer = useRef();
    const { dispatch, parameters } = useContext(GlobalContext);
    const requiredFields = useRef({})

    const errorHandler = (error) => {
        dispatch({
            type: "modal",
            payload: {
                type: "error",
                errCode: error
            }
        })
    }

    const sendToAPI = async (dataItem) => {
        if (debug) console.log(id, { dataItem });
        
        if (fileUpload) {
            console.log("before we append:", vFormData.current);
            const formData = new FormData()
            formData.append('file', vFormData.current);
            formData.append('context', context);
            return await fetch(`/api${APIURL}`, {
                method: 'POST',
                body: formData
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
        //
        return await fetch(`/api${APIURL}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(dataItem)
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

    }

    const isOkToSave = () => {
        const workingData = vFormData.current;
        let okToSave = false;
        console.log("working data:", workingData)

        Object.keys(workingData).forEach(record => {
            okToSave = Object.keys(requiredFields.current).every(field => {
                // console.log("okToSave:", field, workingData[record][field] != "")
                return workingData[record][field] != "";
            })
        })
        return okToSave;
    }

    const handleFormUpdate = async () => {
        let apiResponse;
        if (fileUpload) {
            apiResponse = sendToAPI(vFormData.current);

        } else {
            const workingData = vFormData.current;
            if (debug) console.log("form data:", vFormData.current);
            //
            apiResponse = await Promise.all(Object.keys(workingData).map(async record => {
                const dataItem = {
                    ...workingData[record],
                    ...additionalIds,
                    id: record
                }
                return await sendToAPI(dataItem);
            }))

        }

        if (apiResponse[0]?.err) {
            errorHandler(apiResponse[0].err.code);
        } else {
            if (followUp) {
                console.log("followUp:", {apiResponse})
                followUp(apiResponse);
            }
        }
    }

    const autoSave = () => {
        if (debug) console.log({ vFormData })
        const okToSave = isOkToSave();
        if (okToSave) {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                saveTimer.current = null;
            }
            saveTimer.current = setTimeout(() => handleFormUpdate(), timeout);
        } else {
            clearTimeout(saveTimer.current);
            saveTimer.current = null;
            setFlagRequiredFields(true);
        }
    }

    const manualSave = () => {
        const okToSave = isOkToSave();
        if (okToSave || fileUpload) {
            dispatch({
                type: "modal",
                payload: {
                    type: "hide"
                }
            })
            if (debug) console.log({ vFormData })
            subActions?.forEach(action => {
                console.log(action);
                action();
            })
            handleFormUpdate();
        } else {
            setFlagRequiredFields(true)
        }
    }

    const updateForm = (input, recordIdFromProps) => {
        if (debug) console.log("updateForm:", { input }, { recordIdFromProps })
        
        if (fileUpload) {
            vFormData.current = input;
            console.log("uploaded:", vFormData.current)
            return null;
        }
        const updatedRecordId = recordIdFromProps ? recordIdFromProps : recordId;
        //
        const updatedRecord = vFormData.current[updatedRecordId] ? vFormData.current[updatedRecordId] : {};
        vFormData.current[updatedRecordId] = { ...updatedRecord, ...input };
        if (debug) console.log("updated Form Data", vFormData.current);
        if (!manual) autoSave();
    }

    const bindControlToForm = (children) => {
        if (debug) console.log(`${id} binding`, { children });
        const newChildren = React.Children.map(children, child => {
            if (!child || !child.props) return null;
            if (debug) console.log(`scanning ${child.props?.field}`, { child });
            if (child.props?.updateForm) return child;

            let grandChildren = null;
            if (child.props?.children) {
                if (typeof child.props.children === 'object') {
                    grandChildren = bindControlToForm(child.props.children);
                } else {
                    grandChildren = child.props.children;
                }
            }
            
            if (child.props.name === "submit") return React.cloneElement(child, { onClick: manualSave }, grandChildren);
            if (child.props.initialValue && !child.props.value) {
                const initializedRecordId = child.props.recordId ? child.props.recordId : recordId;
                const updatedRecord = vFormData.current[initializedRecordId] ? vFormData.current[initializedRecordId] : {};
                vFormData.current[initializedRecordId] = { ...updatedRecord, [child.props.field]: child.props.initialValue };
            }

            if (child.props.field) {
                if (child.props.isRequired) {
                    requiredFields.current = { ...requiredFields.current, [child.props.field]: true }
                }
                return React.cloneElement(child, { updateForm: updateForm }, grandChildren);
            }
            
            return React.cloneElement(child, {}, grandChildren);
        })
        
        return newChildren;
    }

    const newChildren = bindControlToForm(children);
      
    return (
        <object name={`vform-${id}`} className={`vform ${flagRequiredFields ? "missing-data" : ""}`}>
            {newChildren}
        </object>
    );
}

export default VForm;