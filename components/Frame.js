import Meta from './Meta';
import Nav from './Nav';
import Modal from '../components/Modal';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { MENUOPTIONS } from '../config/index';

const Frame = ({ children }) => {

    return (
        <>
            <Meta />
            <div className="app-body">
                <Modal />
                <Nav menuOptions={MENUOPTIONS} />
                <DndProvider backend={HTML5Backend}>
                    {children}
                </DndProvider>
            </div>
        </>
    )
}

export default Frame;