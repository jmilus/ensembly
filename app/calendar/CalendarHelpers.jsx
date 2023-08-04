'use client'

import { useState } from 'react';

import {CheckBox} from '../../components/Vcontrols';

import useStatus from '../../hooks/useStatus';
import ModalWrapper from '../../components/ModalWrapper';
import { useRouter, usePathname } from 'next/navigation';

const getInitialEventLineups = (model) => {
    let lineupsInEvents = {}
    model.events.forEach(event => {
        lineupsInEvents[event.id] = {}
        event.lineups.forEach(lu => {
            lineupsInEvents[event.id][lu.id] = true;
        })
    })
    return lineupsInEvents;
}


export function LineupsGrid({ model, allLineups }) {
    const router = useRouter();
    const path = usePathname();

    let modelLineups = {}
    model.events.forEach(event => {
        event.lineups.forEach(lineup => {
            modelLineups[lineup.id] = {...lineup}
        })
    })

    const [eventLineups, setEventLineups] = useState(getInitialEventLineups(model));
    const status = useStatus();

    console.log({eventLineups})

    const handleChangeLineupAssignment = (action, event, lineup) => {
        let tempEventLineups = { ...eventLineups };

        tempEventLineups[event][lineup] = action;
        
        setEventLineups(tempEventLineups)
    }

    const setAll = (lineup) => {
        let tempEventLineups = { ...eventLineups };

        const allChecked = Object.keys(tempEventLineups).every(event => {
            return tempEventLineups[event][lineup];
        })

        Object.keys(tempEventLineups).forEach(key => {
            tempEventLineups[key][lineup] = !allChecked;
        })

        setEventLineups(tempEventLineups);
    }

    const submitEventLineups = async () => {
        let events = [];
        let lineupsSet = [];
        Object.keys(eventLineups).forEach(event => {
            events.push(event);
            const lineups = Object.keys(eventLineups[event]).filter(lu => eventLineups[event][lu] === true)
            lineupsSet.push(lineups)
        })
        status.saving();

        return fetch('/api/calendar/event', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventLineups)
        })
            .then(response => response.json())
            .then(res => {
                status.saved()
                return res
            })
            .catch((err, message) => {
                status.error()
                console.error("update failed", message);
                return err;
            })
        
    }

    return (
        <ModalWrapper title="Events & Lineups">
            <div className="lineup-grid">
                    <div className="event-row grid-header">
                        <div className="event-header lineup-column"></div>
                        {
                            Object.values(modelLineups).map((ms, i) => {
                                return (
                                    <div key={i} className="lineup-header lineup-column" >
                                        <button className="column-button" onClick={() => setAll(ms.id)}>{ms.name}</button>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <article>
                        {
                            model.events.map((event, e) => {
                                return (
                                    <div key={e} className="event-row">
                                        <div className="event-header lineup-column">
                                            <span>{event.name || model.name}</span><br/>
                                            <span style={{color: "var(--color-cactus)"}}>{new Date(event.eventStartDate).toDateString()}</span>
                                        </div>
                                        {
                                            Object.values(modelLineups).map((lineup, l) => {
                                                const isChecked = eventLineups[event.id] ? eventLineups[event.id][lineup.id] : false;
                                                return (
                                                    <div key={l} className="lineup-column" >
                                                        <CheckBox id={`${e}-${l}`} shape="button" value={isChecked} extraAction={(action) => handleChangeLineupAssignment(action, event.id, lineup.id)} />
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
                <button onClick={() => router.replace(path.slice(0, path.indexOf("/$")))}>Cancel</button>
                <button name="submit" onClick={submitEventLineups}>Save</button>
            </section>
        </ModalWrapper>
    )
}