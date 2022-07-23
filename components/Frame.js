import { useContext } from 'react';

import Meta from './Meta';
import Nav from './Nav';
import Modal from '../components/Modal';

import { ACTION_TYPES, GlobalContext } from "../pages/_app";
import { MENUOPTIONS } from '../config/index';

const Frame = ({ children }) => {
    const { dispatch, state } = useContext(GlobalContext);
    const { modal } = state;

    const hideModal = () => {
        dispatch({
            type: ACTION_TYPES.HIDE_MODAL
        })
    }

    return (
        <>
            <Meta />
            <div className="app-body">
                <Modal data={modal}/>
                <Nav menuOptions={MENUOPTIONS}/>
                {children}
            </div>
        </>
    )
}

export default Frame;