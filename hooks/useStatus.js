'use client';

import { useRouter } from 'next/navigation';
import { useRef, useContext } from 'react';

import { GlobalContext } from "../components/ContextFrame";

function useStatus() {
    const { dispatch } = useContext(GlobalContext);
    const transitionTimer = useRef()
    const router = useRouter();

    const vanish = () => {
        dispatch({
            route: "status",
            payload: null
        })
    }

    const saving = () => {
        console.log("now saving...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: "saving"
        })
    }

    const loading = () => {
        cosnsole.log("loading data...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: "loading"
        })
    }

    const saved = () => {
        console.log("Data saved!")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: "saved"
        })
        router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 2000)
    }
    
    return {saving, loading, saved};
}

export default useStatus;