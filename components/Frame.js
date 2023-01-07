import { useEffect, useContext } from 'react';

import Meta from './Meta';
import Nav from './Nav';
import DropDownMenu from '../components/DropDownMenu';
import Modal from '../components/Modal';
import { GlobalContext } from '../pages/_app';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { MENUOPTIONS } from '../config/index';

import styles from '../styles/Frame.module.css';

const Frame = ({ children }) => {
    const { parameters, dispatch } = useContext(GlobalContext);
    
    return (
        <>
            <Meta />
            <div className="app-body">
                <DropDownMenu />
                <Modal />
                {true ?
                    <>
                        <Nav menuOptions={MENUOPTIONS} />
                        <DndProvider backend={HTML5Backend}>
                            {children}
                        </DndProvider>
                    </>
                    :
                    <div className={styles.signinBox}>
                        <div className={styles.signinHeader}>
                            Login to Ensembly
                        </div>
                        <div className={styles.signinBody}>
                            
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default Frame;