'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useContext } from 'react';

import { BlipContext } from 'components/BlipContext';

function useStatus() {
    const { setBlipState } = useContext(BlipContext);
    const transitionTimer = useRef()
    const router = useRouter();

    const vanish = () => {
        transitionTimer.current = null;
        setBlipState(null)
    }

    const unsaved = (caption, saveAction) => {
        console.log("data is unsaved")
        
        setBlipState({ mode: "unsaved", action: saveAction, caption })
    }

    const saving = (caption) => {
        console.log("now saving...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "saving", caption })
    }

    const loading = (caption) => {
        console.log("loading data...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "loading", caption })
    }

    const saved = (caption) => {
        console.log("Data saved!")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "saved", caption })
        router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 4000)
    }

    const error = (caption, error) => {
        console.error(error)
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "error", caption })
        // router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 10000)
    }
    
    return {unsaved, saving, loading, saved, error, vanish};
}

export default useStatus;