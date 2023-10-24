'use client'

import { useState, createContext, useContext } from 'react'

export const BlipContext = createContext(null)

const StatusBlipContext = ({ children }) => {
    const [blipState, setBlipState] = useState({})

    return (
        <BlipContext.Provider value={{ blipState, setBlipState }}>
            {children}
        </BlipContext.Provider>
    )
}

export default StatusBlipContext;