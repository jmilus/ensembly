'use client'

import { usePathname } from 'next/navigation';

import { useState, useContext } from 'react';
import { GlobalContext } from './ContextFrame';

import '../styles/statusBlip.css';

const StatusBlip = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { status } = parameters;
    const path = usePathname();

    // console.log("blip path:", path)

    const dismissBlip = () => {
        dispatch({
            route: "status",
            payload: null
        })
    }

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
        let blipAction = action;
        switch (type) {
            case "unsaved":
                caption = "Click to Save";
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
        return <div className={`status-blip-body ${type}`}>
            <span onClick={blipAction}>{caption}</span>
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