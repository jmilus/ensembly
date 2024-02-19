'use client'

import { useState } from 'react';

import {CheckBox} from 'components/Vcontrols';

import useStatus from 'hooks/useStatus';
import ModalButton from 'components/ModalButton';

import { generateGrid, listModelLineups } from 'utils/lineupHelpers';

export function LineupsGrid({ model, allLineups}) {
    const [grid, setGrid] = useState(generateGrid(model))

    const modelLineups = listModelLineups(model)
    const status = useStatus();

    console.log({ modelLineups })
    
    const isLineupInAllEvents = (lineup) => {
        return Object.values(grid).every(event => {
            return event[lineup] && event[lineup] === true;
        })
    }

    const doesEventHaveAllLineups = (event) => {
        return Object.values(grid[event]).every(lineup => lineup)
    }

    const handleToggleSingle = (action, event, lineup) => {
        const tempGrid = { ...grid }
        tempGrid[event][lineup] = action;
        setGrid(tempGrid);
    }

    const handleToggleLineup = (lineup) => {
        const action = !isLineupInAllEvents(lineup)
        const tempGrid = { ...grid }
        Object.keys(tempGrid).forEach(event => {
            tempGrid[event][lineup] = action;
        })
        setGrid(tempGrid)
    }

    const handleToggleEvent = (event) => {
        const action = !doesEventHaveAllLineups(event)
        const tempGrid = { ...grid }
        modelLineups.forEach(lineup => {
            tempGrid[event][lineup] = action;
        })
        setGrid(tempGrid);
    }

    const saveChanges = () => {
        status.saving()
        const result = fetch(`/api/calendar/event/model/${model.id}/lineups`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(grid)
        })
            .then(response => response.json())
            .then(res => {
                status.saved()
                console.log(res)
            })
            .catch((err, message) => {
                status.error()
                console.error("update failed", message);
                return err;
            })
        
        return true;
    }
    

    return (
        <ModalButton
            title="Manage Lineups"
            renderButton={<><i>view_list</i><span>Manage Lineups</span></>}
            buttonClass="fit"
        >
            <div id="event-lineup-grid">
                <div className="event-lineup-grid-row">
                    <div className="event-lineup-grid-cell"></div>
                    {
                        modelLineups.map((ml, i) => {
                            return (
                                <div key={i} className="event-lineup-grid-header event-lineup-grid-cell" >
                                    <button className="grid-header-button" onClick={() => handleToggleLineup(ml.id)}>{ml.name}</button>
                                </div>
                            )
                        })
                    }
                </div>
                <article className="scroll">
                    {
                        model.events.map((event, e) => {
                            return (
                                <div key={e} className="event-lineup-grid-row">
                                    <button className="grid-header-button event-lineup-grid-cell" onClick={() => handleToggleEvent(event.id)}>
                                        <span>{event.name || model.name}</span>
                                        <span style={{ color: "var(--color-c2)" }}>{new Date(event.eventStartDate).toDateString()}</span>
                                    </button>
                                    {
                                        modelLineups.map((lineup, l) => {
                                            const isChecked = grid[event.id] ? grid[event.id][lineup.id] : false;
                                            return (
                                                <div key={l} className="event-lineup-grid-cell" >
                                                    <CheckBox id={`${e}-${l}`} shape="button" value={isChecked} extraAction={(action) => handleToggleSingle(action, event.id, lineup.id)} />
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </article>
            </div>
            <section className="modal-buttons">
                <button name="submit" className="fit" onClick={saveChanges}>Save Changes</button>
            </section>
        </ModalButton>
    )
}