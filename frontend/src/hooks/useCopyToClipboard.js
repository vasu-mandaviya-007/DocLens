import { useCallback, useEffect, useRef, useState } from "react";


export async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);
        return true;

    } catch (e) {

        return false;

    }
}

export function useCopyToClipboard(resetMs = 1500) {

    const [copied, setCopied] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = useCallback(async (text) => {
        const ok = await copyText(text);
        if (ok) {
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), resetMs);
        }
        return ok;
    }, [resetMs]);

    return { copied, copy };

}