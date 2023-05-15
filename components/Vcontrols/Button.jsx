'use client';

import './Vstyling.css';

const Button = (props) => {
    const { name, label, APIURL, payload, output, debug } = props;

    if (debug) console.log({ props })

    const executeAPI = async () => {
        const APIButtonResponse = await fetch(`/api${APIURL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(res => {
                console.log("button response:", res)
                return res
            })
            .catch((err, message) => {
                console.error("API button failed", message);
                return err;
            })
        
        return APIButtonResponse;
    }

    return (
        <button name={name} onClick={executeAPI}>{label}</button>
    )
}

export default Button;