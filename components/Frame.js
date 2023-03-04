import { useEffect, useContext } from 'react';

import Meta from './Meta';
import Nav from './Nav';
import DropDownMenu from '../components/DropDownMenu';

import Modal from '../components/Modal';
import LoginBox from '../components/LoginBox';
import { GlobalContext } from '../pages/_app';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useSession } from '@supabase/auth-helpers-react';


const Frame = ({ children }) => {
    const { parameters, dispatch } = useContext(GlobalContext);
    console.log((parameters))
    
    const session = useSession();
    const userId = session?.user.id;

    useEffect(() => {
        console.log({ session })
        const getPermissions = async () => {
            return await fetch('/api/general/getUserPermissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({email: session.user.email})
            })
                .then(response => response.json())
                .then(res => {
                    console.log("permissions:", res.permissions.security);
                    dispatch({
                        route: "permissions",
                        payload: res.permissions.security
                    })
                    return res;
                })
                .catch((err, message) => {
                    console.log('failed to load user permissions');
                })
        }
        if(session) getPermissions()
        
    }, [userId])
    
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