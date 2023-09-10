'use client';

import { usePathname } from 'next/navigation';
import useStatus from '../../hooks/useStatus';
// import './Vstyling.css';

const Button = (props) => {
    const { name, label, APIURL, METHOD, payload, output, buttonClass, style, debug } = props;

    if (debug) console.log({ props })
    const path = usePathname()
    const status = useStatus();

    let fetchURL;
    if (APIURL) {
        fetchURL = APIURL.startsWith('/') ? APIURL : `/api${path}/${APIURL}`
    } else {
        fetchURL = `/api${path}`
    }

    const executeAPI = async () => {
        status.saving()
        const APIButtonResponse = await fetch(fetchURL, {
            method: METHOD || 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(res => {
                status.saved()
                console.log("button response:", res)
                return res
            })
            .catch((err, message) => {
                status.error()
                console.error("API button failed", message);
                return err;
            })
        
        return APIButtonResponse;
    }

    return (
        <button name={name} className={buttonClass} style={style} onClick={executeAPI}>{label}</button>
    )
}

export default Button;