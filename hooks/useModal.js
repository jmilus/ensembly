import { useContext, useEffect } from 'react';

import { GlobalContext } from "../pages/_app";

function useModal(mode, content) {
    const { dispatch } = useContext(GlobalContext);

    useEffect(() => {
        dispatch({
            type: "modal",
            payload: {
                type: mode
            }
        })

    }, [mode])

    return null;
}

export default useModal;