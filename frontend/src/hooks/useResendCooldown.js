import { useCallback, useEffect, useRef, useState } from "react";
import { getOtpCooldown } from "../apis/authApi.js";

/**

 * @param purpose
 * @param email
 * @param enabled 
 * @returns { secondsLeft, checking, start }

 */
export function useResendCooldown(purpose, email, enabled) { 
    const [endsAt, setEndsAt] = useState(0);
    const [now, setNow] = useState(() => Date.now());
    const [checking, setChecking] = useState(false);
    const version = useRef(0);

    const secondsLeft = Math.max(0, Math.ceil((endsAt - now) / 1000));
    const running = secondsLeft > 0;

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(id);
    }, [running]);

    const apply = useCallback((seconds) => {
        const t = Date.now();
        setNow(t);
        setEndsAt(t + seconds * 1000);
    }, []);

    const start = useCallback(
        (seconds) => {
            version.current += 1;
            apply(seconds);
        },
        [apply]
    );

    useEffect(() => {
        if (!enabled || !email) {
            setEndsAt(0);
            setChecking(false);
            return;
        }

        let cancelled = false;
        const myVersion = version.current;
        setChecking(true);

        getOtpCooldown(email, purpose)
            .then(({ retry_after }) => {
                if (!cancelled && version.current === myVersion) apply(retry_after);
            })
            .catch(() => {
               
            })
            .finally(() => {
                if (!cancelled) setChecking(false);
            });

        return () => {
            cancelled = true;
        };
    }, [enabled, email, purpose, apply]);

    return { secondsLeft, checking, start };
}