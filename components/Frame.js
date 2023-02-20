import { useContext } from 'react';

import Meta from './Meta';
import Nav from './Nav';
import DropDownMenu from '../components/DropDownMenu';

import Modal from '../components/Modal';
import LoginBox from '../components/LoginBox';
import { GlobalContext } from '../pages/_app';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
//
import { useSession } from '@supabase/auth-helpers-react';


const Frame = ({ children }) => {
    const { parameters } = useContext(GlobalContext);
    
    const session = useSession();
    
    if (session) {
        return (
            <>
                <Meta />
                <div className="app-body">
                    {parameters.dropdown && <DropDownMenu />}
                    <Modal />
                    <>
                        <Nav />
                        <DndProvider backend={HTML5Backend}>
                            {children}
                        </DndProvider>
                    </>
                </div>
            </>
        )
    } else {
        return (
            <LoginBox />
        )
    }
}

export default Frame;