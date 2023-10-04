'use client';

import { useRouter, usePathname } from 'next/navigation';
import useStatus from '../../hooks/useStatus';

const Button = (props) => {
    const { name, caption, APIURL, METHOD, formType, payload, followPath, statusCaptions = {}, buttonClass, style, debug } = props;

    if (debug) console.log({ props })
    const router = useRouter();
    const path = usePathname()
    const status = useStatus();

    let fetchURL;
    if (APIURL) {
        fetchURL = APIURL.startsWith('/') ? APIURL : `/api${path}/${APIURL}`
    } else {
        fetchURL = `/api${path}`
    }

    const executeAPI = async () => {
        status.saving(statusCaptions.saving)
        let APIButtonResponse;
        switch (formType) {
            case "form":
                break;
            case "json":
            default:
                APIButtonResponse = await fetch(fetchURL, {
                    method: METHOD || 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then(response => response.json())
                    .then(res => {
                        status.saved(statusCaptions.saved)
                        console.log("button response:", res)
                        if (followPath) {
                            let newPath = followPath;
                            if (followPath.includes("$slug$")) {
                                newPath = followPath.startsWith("$slug$") ? `./${path}/${followPath}` : followPath;
                                newPath = newPath.replace("$slug$", res.id);
                            }
                            console.log("following", newPath)
                            router.push(newPath)
                            router.refresh()
                        }
                        return res
                    })
                    .catch((err, message) => {
                        status.error(statusCaptions.error)
                        console.error("API button failed", message);
                        return err;
                    })
                break;
        }
        return APIButtonResponse;
    }

    return (
        <button name={name} className={buttonClass} style={style} onClick={executeAPI}>{caption}</button>
    )
}

export default Button;