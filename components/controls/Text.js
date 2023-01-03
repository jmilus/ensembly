import { useState } from 'react';

const Text = (props) => {
    const { id, field, label, value, format, initialValue, limit, Vstyle, hero, isRequired, recordId, updateForm, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue);

    if (debug) console.log(field, { props }, { controlValue });

    const handleControlValueChange = (input) => {
        let textvalue = input;
        switch (format) {
            case "phone":
                textvalue = input.replace(/[^0-9]*/gm, '');
                break;
            default:
                break;
        }
        console.log("sending this to VForm:", textvalue)
        if (updateForm) updateForm({ [field]: textvalue }, recordId);
        setControlValue(textvalue);
    }

    let displayTextValue = controlValue;
    switch (format) {
        case "phone":
            if (controlValue?.length > 4) {
                if (controlValue.length > 7) {
                    if (controlValue.length >= 10) {
                        if (controlValue.length > 10) {
                            displayTextValue = "+" + displayTextValue.slice(0, -10) + " " + displayTextValue.slice(-10);
                        }
                        displayTextValue = displayTextValue.slice(0, -10) + "(" + displayTextValue.slice(-10);
                    }
                    displayTextValue = displayTextValue.slice(0, -7) + ") " + displayTextValue.slice(-7);
                }
                displayTextValue = displayTextValue.slice(0, -4) + "-" + displayTextValue.slice(-4);
            }
            break;
        default:
            break;
    }

    const inputControl = limit > 100
        ? <textarea
            id={id}
            field={field}
            value={controlValue}
            type="text"
            className="text-input"
            onChange={(e) => handleControlValueChange(e.target.value)}
            required={isRequired}
            autoComplete="do-not-autofill"
            maxLength={limit}
            readOnly={readonly}
        />
        : <input
            id={id}
            field={field}
            value={displayTextValue}
            type="text"
            className="text-input"
            onChange={(e) => handleControlValueChange(e.target.value)}
            required={isRequired}
            autoComplete="do-not-autofill"
            maxLength={limit}
            readOnly={readonly}
        />
    return (
        <div className={`input-control-base text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={Vstyle}>
            <label htmlFor={id} className="label">{label}</label>
            {inputControl}
        </div>
    );
}

export default Text;