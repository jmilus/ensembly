import { useEffect, useContext } from 'react';
import useSWR from 'swr';

import { GlobalContext } from "../pages/_app";

function useLoader(swrKey, setter, fetchAPI, params) {
    const { dispatch } = useContext(GlobalContext);
    //
    const { data, error } = useSWR(swrKey, async () => {
        const response = await fetch(fetchAPI, params ? {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(params)
        } : null);
        const data = await response.json();
        return data;
    });
    //
    useEffect(() => {
        const swrReturn = () => {
            if (!data && !error) return { type: "load" }
            if (error) return { type: "error", message: error }
            setter(data);
            return {type: "hide"}
        }
        const payload = swrReturn();

        dispatch({type:"modal", payload: payload})
    }, [data])

    return null;
}

export default useLoader;