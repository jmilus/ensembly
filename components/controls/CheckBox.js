import { useState } from 'react';

const CheckBox = (props) => {
    const { id, field, label, value, initialValue, Vstyle, children, recordId, updateForm, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue);

    if (debug) console.log(field, { props }, { controlValue });

    const handleControlValueChange = (input) => {
        console.log("updateForm value:", input)
        if (updateForm) updateForm({ [field]: input }, recordId);
        setControlValue(input);
    }

    return (
        <div className={`input-control-base checkbox${controlValue ? " checked" : ""}${readonly ? " readonly" : ""}`} onClick={readonly ? null : () => handleControlValueChange(!controlValue)} style={Vstyle} >
            {controlValue ? <i>check_box</i> : <i>check_box_outline_blank</i>}
            <input id={id} type="checkbox" value={controlValue} />
            <label htmlFor={id} className="label" onClick={(e) => e.stopPropagation()}>{label}</label>
        </div>
    )
}

export default CheckBox;