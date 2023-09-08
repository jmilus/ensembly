'use client'

import { usePathname } from 'next/navigation';

import { useState, useRef, useEffect, useContext } from 'react';
import { GlobalContext } from './ContextFrame';

import '../styles/statusBlip.css';

const StatusBlip = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { status } = parameters;
    const [timeToDie, setTimeToDie] = useState(null)
    const tickdown = useRef(null)
    const path = usePathname();

    const dismissBlip = () => {
        if (timeToDie != null) setTimeToDie(null)
        dispatch({
            route: "status",
            payload: null
        })
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
        // console.log("StatusBlip is rendering")
        if (status?.path && status?.path != path) {
            tickdownTimer(5)
        }
    }, [path])

    const openModal = (error) => {
        dismissBlip()
        dispatch({
            route: "modal",
            payload: {
                type: "error",
                content: {
                    title: error.title,
                    error: error.message
                }
            }
        })
    }

    const blipIcon = (type, error, action) => {
        let caption;
        let dismiss = false;
        let timeout = "";
        let blipAction = action;
        switch (type) {
            case "unsaved":
                caption = "Click to Save";
                timeout = timeToDie === 0 ? " fade" : ""
                break;
            case "saving":
                caption = "Saving...";
                break;
            case "loading":
                caption = "Loading...";
                break;
            case "saved":
                caption = "Saved!";
                break;
            case "error":
                caption = "Error";
                dismiss = true;
                blipAction = () => openModal(error);
                break;
            default:
                return null;
        }
        return <div className={`status-blip-body ${type}${timeout}`}>
            <div className="blip-caption" onClick={blipAction}>{status.caption || caption}</div>
            {timeToDie != null ?
                <div className="blip-timer">
                    <div className="timer-arc"></div>
                    <div className="timer-number">{timeToDie}</div>
                </div>
                : null
            }
            {dismiss && <i onClick={dismissBlip}>close</i>}
        </div>
    }

    if (status) {
        const icon = blipIcon(status.case, status.error, status.action)
        return (
            <div className="status-blip">
                {icon}
            </div>
        )
    }
    return null;
}

export default StatusBlip;