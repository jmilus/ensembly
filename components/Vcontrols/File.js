import { useState } from 'react';

const File = (props) => {
    const { id, field, label="Browse Files", limit, Vstyle, hero, isRequired, fileType, handling, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(label);

    if (debug) console.log(field, { props }, { controlValue });

    const handleControlValueChange = (input) => {
        let file = input.files[0];
        console.log({ file })
        if (input.files) {
            switch (handling) {
                case "upload":
                    const extlen = fileType.length;
                    if (file.name.slice(-extlen) === fileType) {
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
        <div className={`input-control-base file-box${hero ? " hero" : ""}${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={Vstyle}>
            <label htmlFor={id} className="icon-and-label">
                <i>description</i>
                {controlValue}
                <input
                    id={id}
                    field={field}
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