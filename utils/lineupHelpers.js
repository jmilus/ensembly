export const generateGrid = (model) => {
    
    let lineupsInEvents = {}
    model.events.forEach(event => {
        lineupsInEvents[event.id] = {}
        event.lineups.forEach(lu => {
            lineupsInEvents[event.id][lu.id] = true;
        })
    })
    return lineupsInEvents;
}

export const listModelLineups = (model) => {
    const modelLineups = {}
    model.events.forEach(event => {
        event.lineups.forEach(lineup => {
            modelLineups[lineup.id] = {...lineup}
        })
    })
    const mlArray = Object.values(modelLineups).map(ml => ml);
    return mlArray.sort((a, b) => {
        return new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf()
    })
}