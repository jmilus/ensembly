'use client';

import { useRouter, usePathname } from 'next/navigation';
import useStatus from '../../hooks/useStatus';

const Button = (props) => {
    const { name, caption, APIURL, METHOD, payload, json, followPath, statusCaptions = {}, buttonClass, style, debug } = props;

    if (debug) console.log({ props })
    const router = useRouter();
    const path = usePathname().replace('/e/', '/api/')
    const status = useStatus();
    console.log(name, path)

    const fetchURL = APIURL ? APIURL : path;

    const executeAPI = async () => {
        status.saving(statusCaptions.saving)
        let APIButtonResponse;
        let data;
        if (json) {
            data = JSON.stringify(payload)
        } else {
            const formData = new FormData()
            Object.keys(payload).forEach(field => {
                formData.append(field, payload[field])
            })
            data = formData
        }
        
        APIButtonResponse = await fetch(fetchURL, {
            method: METHOD || 'PUT',
            headers: json ? { 'Content-Type': 'applicaiton/json' } : {},
            body: data
        })
            .then(response => response.json())
            .then(res => {
                console.log("button response:", res)
                if (res.error) throw res.error;
                status.saved(statusCaptions.saved)
                if (followPath) {
                    let newPath = followPath;
                    if (followPath.includes("$slug$")) {
                        newPath = newPath.replace("$slug$", res.id);
                    }
                    console.log("following", newPath)
                    router.push(newPath)
                    router.refresh()
                }
                return res
            })
            .catch(error => {
                status.error(statusCaptions.error)
                console.error("API button failed", error);
                return error;
            })
        return APIButtonResponse;
    }

    return (
        <button name={name} className={buttonClass} style={style} onClick={executeAPI}>{caption}</button>
    )
}

export default Button;