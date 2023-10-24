'use client'

import { usePathname, useRouter } from 'next/navigation';
import _ from 'lodash'

import { useState, useRef, useEffect, useContext } from 'react';
import { BlipContext } from 'components/BlipContext';

import '../styles/statusBlip.css';

const StatusBlip = () => {
    const { blipState, setBlipState } = useContext(BlipContext);
    const [timeToDie, setTimeToDie] = useState(null)
    const tickdown = useRef(null)
    const path = usePathname();
    const router = useRouter();
    
    const { mode, caption, saveFunction, payload, followPath, error, prevpath } = blipState;

    const dismissBlip = () => {
        if (timeToDie != null) setTimeToDie(null)
        setBlipState({})
    }

    const tickdownTimer = (seconds) => {
        if (seconds >= 0) {
            setTimeToDie(seconds)
            tickdown.current = setTimeout(() => tickdownTimer(seconds -1), 1000)
        } else {
            setTimeToDie(null)
            tickdown.current = null;
            dismissBlip()
        }
    }

    useEffect(() => {
        if (prevpath && prevpath != path) {
            tickdownTimer(5)
        }
    }, [path])

    const blipIcon = () => {
        let myCaption;
        let dismiss = false;
        let timeout = "";

        let clickAction;
        if (saveFunction) {
            clickAction = saveFunction;
        } else if (payload) {
            clickAction = () => {
                setBlipState({ mode: "saving" })
                fetch(path.replace('/e/', '/api/'), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then(response => response.json())
                    .then(res => {
                        console.log({ res })
                        if (res.error) throw res.error;
                        if (followPath) {
                            let newPath = followPath;
                            if (followPath.includes("$slug$")) {
                                newPath = newPath.replace("$slug$", res.id);
                            }
                            
                            router.push(newPath)
                        }
                        setBlipState({ mode: "saved" })

                    })
                    .catch(error => {
                        setBlipState({ mode: "error", error: { title: "Save Error", error } })
                    })
            }
        }

        switch (mode) {
            case "unsaved":
                myCaption = caption || "Click to Save";
                timeout = timeToDie === 0 ? " fade" : "";
                dismiss = true;
                break;
            case "saving":
                myCaption = caption || "Saving...";
                break;
            case "loading":
                myCaption = caption || "Loading...";
                break;
            case "saved":
                myCaption = caption || "Saved!";
                break;
            case "error":
                myCaption = caption || "Error";
                dismiss = true;
                console.error(error)
                break;
            default:
                return null;
        }
        return <div className={`status-blip-body ${mode}${timeout}`}>
            <div className="blip-caption" onClick={clickAction}>{myCaption}</div>
            {timeToDie != null ?
                <div className="blip-timer">
                    <div className="timer-arc"></div>
                    <div className="timer-number">{timeToDie}</div>
                </div>
                : null
            }
            {dismiss && <i style={{ marginRight: "10px" }} onClick={dismissBlip}>close</i>}
        </div>
    }

    if (_.isEmpty(blipState)) return null;

    const icon = blipIcon()
    return (
        <div className="status-blip">
            {icon}
        </div>
    )
}

export default StatusBlip;