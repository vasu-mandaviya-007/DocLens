import { useState, useEffect } from 'react'

export const useIsDesktop = (breakpoint = 1024) => {
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== "undefined" ? window.innerWidth >= breakpoint : true
    );
    useEffect(() => {
        const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
        const handler = (e) => setIsDesktop(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [breakpoint]);
    return isDesktop; 
};

export default useIsDesktop;