'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useContext } from 'react';

import { BlipContext } from 'components/BlipContext';

function useStatus() {
    const { setBlipState } = useContext(BlipContext);
    const transitionTimer = useRef()
    const router = useRouter();
    const path = usePathname()

    const vanish = () => {
        transitionTimer.current = null;
        setBlipState({})
    }

    const unsaved = (props = {}) => {
        const {caption, saveFunction, payload, followPath} = props
        console.log("data is unsaved")
        
        setBlipState({ mode: "unsaved", saveFunction, payload, caption, prevpath: path, followPath })
    }

    const saving = (props = {}) => {
        const { caption } = props;
        console.log("now saving...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "saving", caption })
    }

    const loading = (props = {}) => {
        const { caption } = props;
        console.log("loading data...")
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "loading", caption })
    }

    const saved = (props = {}) => {
        const { caption } = props;
        console.log(caption)
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "saved", caption })
        router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 4000)
    }

    const error = (props = {}) => {
        const { caption, error } = props;
        console.error(error)
        if (transitionTimer.current) clearTimeout(transitionTimer.current)
        setBlipState({ mode: "error", caption })
        // router.refresh()
        transitionTimer.current = setTimeout(() => vanish(), 10000)
    }
    
    return {unsaved, saving, loading, saved, error, vanish};
}

export default useStatus;