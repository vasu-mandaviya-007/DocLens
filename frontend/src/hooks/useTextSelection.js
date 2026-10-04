import { useCallback, useEffect, useRef, useState } from "react";

// Selection toolbar ki logic. Document-level listeners sirf tab lagte hain jab toolbar visible ho,
// isliye 50 messages = 100 listeners wali problem nahi rehti.
export function useTextSelection() {
    const [selection, setSelection] = useState(null); // { text, x, y } | null
    const toolbarRef = useRef(null);
    const visible = selection !== null; 

    const clear = useCallback(() => {
        setSelection(null);
        window.getSelection()?.removeAllRanges();
    }, []);

    // pointerup mouse + touch dono pe fire hota hai (mouseup sirf mouse pe)
    const onPointerUp = useCallback(() => {
        setTimeout(() => {
            const sel = window.getSelection();
            const text = sel?.toString().trim();
            if (!text || sel.rangeCount === 0) {
                setSelection(null);
                return;
            }
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            setSelection({ text, x: rect.left + rect.width / 2, y: rect.top - 12 });
        }, 10);
    }, []);

    useEffect(() => {
        if (!visible) return;
        const hide = (e) => {
            if (toolbarRef.current?.contains(e.target)) return;
            setSelection(null);
        };
        document.addEventListener("pointerdown", hide);
        document.addEventListener("scroll", hide, true);
        return () => {
            document.removeEventListener("pointerdown", hide);
            document.removeEventListener("scroll", hide, true);
        };
    }, [visible]);

    return { selection, toolbarRef, onPointerUp, clear };
}