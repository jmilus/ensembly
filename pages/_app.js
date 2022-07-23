import Frame from '../components/Frame';
import { createContext, useReducer } from 'react';
//
import '../styles/globals.css';

export const GlobalContext = createContext();

export const ACTION_TYPES = {
  SET_MODAL: 'SET_MODAL',
  LOAD_MODAL: 'LOAD_MODAL',
  HIDE_MODAL: 'HIDE_MODAL',
  SET_MEMBERLIST: 'SET_MEMBERLIST',
  SET_ENSEMBLELIST: 'SET_ENSEMBLELIST'
}

const globalReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_MODAL: {
      return { ...state, modal: action.payload.modal };
    }
    case ACTION_TYPES.LOAD_MODAL: {
      return { ...state, modal: {type: "loading"} };
    }
    case ACTION_TYPES.HIDE_MODAL: {
      return { ...state, modal: null };
    }
    case ACTION_TYPES.SET_MEMBERLIST: {
      return { ...state, members: action.payload.members };
    }
    case ACTION_TYPES.SET_ENSEMBLELIST: {
      return { ...state, ensembles: action.payload.ensembles };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const ContextProvider = ({ children }) => {
  const initialState = {
    modal: null,
    members: []
  };

  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
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
