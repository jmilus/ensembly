'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useContext } from 'react';

import { GlobalContext } from "../components/ContextFrame";

function useStatus() {
    const { dispatch } = useContext(GlobalContext);
    const transitionTimer = useRef()
    const router = useRouter();

    const vanish = () => {
        transitionTimer.current = null;
        dispatch({
            route: "status",
            payload: null
        })
    }

    const unsaved = (caption, saveAction) => {
        console.log("data is unsaved")
        
        dispatch({
            route: "status",
            payload: { case: "unsaved", action: saveAction, caption }
        })
    }

    const saving = (caption) => {
        console.log("now saving...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "saving", caption }
        })
    }

    const loading = (caption) => {
        console.log("loading data...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "loading", caption }
        })
    }

    const saved = (caption) => {
        console.log("Data saved!")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "saved", caption }
        })
        router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 4000)
    }

    const error = (caption, title, message) => {
        console.log("Error!")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        dispatch({
            route: "status",
            payload: { case: "error", error: {title, message}, caption }
        })
        // router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 10000)
    }
    
    return {unsaved, saving, loading, saved, error, vanish};
}

export default useStatus;