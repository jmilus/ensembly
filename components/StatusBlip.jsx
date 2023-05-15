'use client'

import { useContext } from 'react';
import { GlobalContext } from './ContextFrame';

import '../styles/statusBlip.css';

const StatusBlip = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { status } = parameters;

    if (status) {
        let statusBody = <></>;
        switch (status) {
            case "saving":
                statusBody = <div className={`status-blip-body ${status}`}>Saving...</div>
                break;
            case "loading":
                statusBody = <div className={`status-blip-body ${status}`}>Loading...</div>
                break;
            case "saved":
                statusBody = <div className={`status-blip-body ${status}`}>Saved!</div>
                break;
            default:
                break;
        }
    
        return (
            <div className="status-blip">
                {statusBody}
            </div>
        )
    }
    return null;
}

export default StatusBlip;