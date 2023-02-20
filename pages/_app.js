import Frame from '../components/Frame';
import { useState, createContext, useReducer } from 'react';
//
import { supabase } from '../lib/supabase-client';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
//
import '../styles/globals.css';

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
    default:
      return null;
  }
}

const ContextProvider = ({ children }) => {
  const initialState = {
    modal: { mode: "hide", content: {} },
    dropdown: null,
    user: {name: "debug"},
    config: {}
  };

  const [ parameters, dispatch ] = useReducer(contextReducer, initialState);

  return (
    <GlobalContext.Provider value={{ parameters, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}

function MyApp({ Component, pageProps }) {
  
  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <ContextProvider>
        <Frame>
          <Component {...pageProps} />
        </Frame>
      </ContextProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
