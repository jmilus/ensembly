import { useRef, useContext } from 'react';

import { GlobalContext } from '../../pages/_app';

import Text from './Text';
import Number from './Number';
import DateTime from './Date';
import Select from './Select';
import CheckBox from './CheckBox';
import File from './File';

const Form = ({ id, recordId, additionalIds, children, APIURL, altSubmit, subActions, followUp, onChange, auto, timeout = 1000, debug }) => {
    const saveTimer = useRef();
    const { dispatch } = useContext(GlobalContext);

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

        if (e.nativeEvent.submitter && e.nativeEvent.submitter.name != "submit") {
            switch (e.nativeEvent.submitter.name) {
                case "cancel":
                default:
                    dispatch({
                        route: "modal",
                        payload: {mode: "hide"}
                    })
                    return null;
            }
        }

        const formElement = e.target.form ? e.target.form : e.target;
        const formData = new FormData(formElement);

        const dataObject = { id: recordId, ...additionalIds }
        const iterator = [...formData.entries()]

        iterator.forEach(item => {
            const key = item[0];
            const val = item[1];
            if (dataObject[key]) {
                if (Array.isArray(dataObject[key])) {
                    dataObject[key].push(val);
                } else {
                    dataObject[key] = [dataObject[key], val]
                }
            } else {
                dataObject[key] = val;
            }
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
                if (followUp) followUp(APIResponse);
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

const VControl = () => {
    return <></>
}

VControl.Form = (props) => <Form {...props} />
VControl.Text = (props) => <Text {...props} />;
VControl.Number = (props) => <Number {...props} />;
VControl.Date = (props) => <DateTime {...props} />;
VControl.Select = (props) => <Select {...props} />;
VControl.Check = (props) => <CheckBox {...props} />;
VControl.File = (props) => <File {...props} />;

VControl.Form.displayName = "Form";
VControl.Text.displayName = "Text";
VControl.Number.displayName = "Number";
VControl.Date.displayName = "Date";
VControl.Select.displayName = "Select";
VControl.Check.displayName = "Check";
VControl.File.displayName = "File";


export default VControl;