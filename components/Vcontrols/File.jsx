'use client'

import { useState } from 'react';

// import './Vstyling.css';

const File = (props) => {
    const { id, name, label="Browse Files", limit, style, hero, isRequired, fileTypes, handling, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(label);

    if (debug) console.log(name, { props }, { controlValue });

    const handleControlValueChange = (input) => {
        let file = input.files[0];
        console.log({ file })
        if (input.files) {
            switch (handling) {
                case "upload":
                    const fileExtension = file.name.slice(file.name.lastIndexOf("."))
                    console.log(fileTypes, fileExtension)
                    if (fileTypes.includes(fileExtension)) {
                        setControlValue(`Selected File: ${file.name}`);
                    } else {
                        setControlValue('Selected file is of wrong type');
                    }
                    break;
                
                case "read":
                    break;
                default:
                    break;
            }
            
        }
    }

    return (
        <div className={`input-control-base file-box${hero ? " hero" : ""}${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={style}>
            <label htmlFor={id} className="icon-and-label">
                <i>description</i>
                {controlValue}
                <input
                    id={id}
                    name={name}
                    type="file"
                    className="text-input"
                    onChange={({ target }) => handleControlValueChange(target)}
                    required={isRequired}
                    autoComplete="do-not-autofill"
                    maxLength={limit}
                    readOnly={readonly}
                />
            </label>
        </div>
    );
}

export default File;