'use client'

import { createContext, useReducer } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const GlobalContext = createContext();

const contextReducer = (parameters, action) => {
    // console.log({parameters}, {action});
    switch (action.route) {
      case "profile":
        parameters.profile = action.payload;
        return { ...parameters };
      case "dropdown":
        parameters.dropdown = action.payload;
        return { ...parameters };
      case "status":
        parameters.status = action.payload;
        return { ...parameters };
      default:
        return null;
    }
}
  
const ContextProvider = ({ profile, children }) => {
    const initialState = {
        profile: profile,
        dropdown: null,
        status: null,
        config: {}
    };
  
    const [parameters, dispatch] = useReducer(contextReducer, initialState);
  
    return (
        <GlobalContext.Provider value={{ parameters, dispatch }}>
            {children}
        </GlobalContext.Provider>
    );
}

const ContextFrame = ({ profile, children }) => {

    return (
        <ContextProvider profile={profile}>
            <DndProvider backend={HTML5Backend}>
                {children}
            </DndProvider>
        </ContextProvider>
    )
}

export default ContextFrame;