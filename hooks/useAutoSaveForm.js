import {useRef} from 'react';

const useAutoSaveForm = () => {
    const saveTimer = useRef(null);

    const shouldIAutoSave = (event) => {
        if (event.target.attributes["data-ignore"]) return false;
        if (event.target.attributes["data-deferupdate"]) return !event.isTrusted;
        return true;
    }

    const autoSaveDelay = (event) => {
        const formId = event.target.form.getAttribute('id');
        if (shouldIAutoSave(event)) {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                saveTimer.current = null;
            }
            saveTimer.current = setTimeout(() => document.forms[formId].requestSubmit(), 3000);
        }
    }

    return {
        autoSaveDelay
    };
}

export default useAutoSaveForm;