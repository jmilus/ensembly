import Frame from '../components/Frame';
import { useState, createContext, useReducer } from 'react';
//
import '../styles/globals.css';

export const GlobalContext = createContext();

const contextReducer = (parameters, action) => {
  console.log({parameters}, {action});
  switch (action.type) {
    case "modal":
      parameters.modal = action.payload;
      return { ...parameters };
    case "dropdown":
      parameters.dropdown = action.payload;
      return { ...parameters };
    case "auth":
      parameters.user = action.payload;
      return { ...parameters };
    default:
      return null;
  }
}

const ContextProvider = ({ children }) => {
  const initialState = {
    modal: { type: "hide", content: {} },
    dropdown: null,
    user: {name: "debug"},
    config: {}
  };

  const [parameters, dispatch] = useReducer(contextReducer, initialState);

  return (
    <GlobalContext.Provider value={{ parameters, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}

function MyApp({ Component, pageProps }) {
  
  return (
    <ContextProvider>
      <Frame>
        <Component {...pageProps} />
      </Frame>
    </ContextProvider>
  );
}

export default MyApp;
