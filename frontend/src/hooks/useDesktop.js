import { useState, useEffect } from 'react'

// Shared across ProfileDashboard (layout) and any page that needs to know
// whether it's rendered inside the desktop two-pane layout or the mobile
// single-screen layout -- e.g. to decide whether a page needs its own
// back button, or can rely on the shared layout header's one instead.
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