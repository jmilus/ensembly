'use client'

import { usePathname } from 'next/navigation';

import { useState, useRef, useEffect, useContext } from 'react';
import { BlipContext } from 'components/BlipContext';

import '../styles/statusBlip.css';

const StatusBlip = () => {
    const { blipState, setBlipState } = useContext(BlipContext);
    const [timeToDie, setTimeToDie] = useState(null)
    const tickdown = useRef(null)
    const path = usePathname();

    const dismissBlip = () => {
        if (timeToDie != null) setTimeToDie(null)
        setBlipState(null)
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
        console.log("StatusBlip is rendering", path)
        if (blipState?.path && blipState?.path != path) {
            tickdownTimer(5)
        }
    }, [path])

    const blipIcon = () => {
        let myCaption;
        let dismiss = false;
        let timeout = "";

        let clickAction;
        switch (typeof blipState?.action) {
            case 'function':
                clickAction = blipState?.action;
                break;
            case 'object':
                console.log("save path:", path.replace('/e/', '/api/'))
                clickAction = () => {
                    setBlipState({ mode: "saving" })
                    fetch(path.replace('/e/', '/api/'), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(action)
                    })
                        .then(response => response.json())
                        .then(res => {
                            setBlipState({ mode: "saved" })
                        })
                        .catch((err, message) => {
                            setBlipState({ mode: "error", error: { title: "Save Error", message } })
                        })
                }
            default:
                break;
        }

        switch (blipState?.mode) {
            case "unsaved":
                myCaption = blipState?.caption || "Click to Save";
                timeout = timeToDie === 0 ? " fade" : "";
                dismiss = true;
                break;
            case "saving":
                myCaption = blipState?.caption || "Saving...";
                break;
            case "loading":
                myCaption = blipState?.caption || "Loading...";
                break;
            case "saved":
                myCaption = blipState?.caption || "Saved!";
                break;
            case "error":
                myCaption = blipState?.caption || "Error";
                dismiss = true;
                // clickAction = () => openModal(error);
                break;
            default:
                return null;
        }
        return <div className={`status-blip-body ${blipState?.mode}${timeout}`}>
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

    const icon = blipIcon()
    if (blipState === null) return null;
    return (
        <div className="status-blip">
            {icon}
        </div>
    )
}

export default StatusBlip;