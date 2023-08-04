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

    const unsaved = (saveFunction) => {
        console.log("data is unsaved")
        dispatch({
            route: "status",
            payload: { case: "unsaved", action: saveFunction }
        })
    }

    const saving = () => {
        console.log("now saving...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "saving" }
        })
    }

    const loading = () => {
        console.log("loading data...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "loading" }
        })
    }

    const saved = () => {
        console.log("Data saved!")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "saved" }
        })
        router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 4000)
    }

    const error = (title, message) => {
        console.log("Error!")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "error", error: {title, message} }
        })
        // router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 10000)
    }
    
    return {unsaved, saving, loading, saved, error};
}

export default useStatus;