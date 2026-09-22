import { useCallback, useRef, useState } from "react";


const useRipple = (onRelease) => { 

    const [ripples, setRipples] = useState([]); // array of { id, x, y, size, active, fading }
    const idCounterRef = useRef(0);
    const activeIdRef = useRef(null); // current press ka id, taaki up/leave usi ko target kare

    const start = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.5;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = ++idCounterRef.current;
        activeIdRef.current = id;

        setRipples((prev) => [...prev, { id, x, y, size, active: false, fading: false }]);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setRipples((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, active: true } : r))
                );
            });
        });
    }, []);

    const settle = useCallback((id) => {
        setRipples((prev) => prev.map((r) => (r.id === id ? { ...r, fading: true } : r)));
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 300);
    }, []);

    const end = useCallback((e) => {
        const id = activeIdRef.current;
        if (id != null) settle(id);
        onRelease?.(e);
    }, [onRelease, settle]);

    const cancel = useCallback(() => {
        const id = activeIdRef.current;
        if (id != null) settle(id);
    }, [settle]);

    return {
        ripples,
        bind: {
            onPointerDown: start,
            onPointerUp: end,
            onPointerLeave: cancel,
            onPointerCancel: cancel,
        },
    };
}


export default useRipple;