import { useRef, useEffect } from 'react';

export function useEvent(name, callback) {
    const ref = useRef(null);
  
    useEffect(() => {
        ref.current?.addEventListener(name, callback);
        return () => ref.current?.removeEventListener(name, callback);
    }, [ref.current, name, callback]);
    
    return [ref, () => ref.current?.dispatchEvent(new Event(name, { bubbles: true }))];
}