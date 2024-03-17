'use client'

import { usePathname } from 'next/navigation';

function useUrl(href) {
    const path = usePathname();

    const segments = path.split("/")
    console.log("useUrl segments:", segments)
    
    return true;
}

export default useUrl;