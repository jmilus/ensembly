'use client'

import { useEffect, createContext, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const GlobalContext = createContext();

const contextReducer = (parameters, action) => {
    // console.log({parameters}, {action});
    switch (action.route) {
      case "modal":
        parameters.modal = action.payload;
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
  
const ContextProvider = ({ children }) => {
    const initialState = {
        modal: { type: "hide", content: {} },
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

const ContextFrame = ({ children }) => {
    return (
        <ContextProvider>
            <DndProvider backend={HTML5Backend}>
                {children}
            </DndProvider>
        </ContextProvider>
    )
}

export default ContextFrame;