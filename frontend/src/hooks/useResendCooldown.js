// src/hooks/useResendCooldown.js
import { useCallback, useEffect, useRef, useState } from "react";
import { getOtpCooldown } from "../apis/authApi.js";

/**
 * Resend button ka countdown. Asli cooldown backend ka hai, isliye bacha hua time backend se pucha jata hai
 * (jab OTP screen dikhe). Isse refresh pe, ya doosre tab/device pe bhi sahi time dikhta hai.
 * Har second backend ko nahi poochte: ek baar pooch ke countdown yahin chalta hai.
 *
 * @param purpose "verify" | "reset"
 * @param email   jis email ka OTP hai
 * @param enabled OTP screen dikh rahi ho tabhi true
 * @returns { secondsLeft, checking, start }
 *   checking:    backend se pooch rahe hain (button tab tak band rakho)
 *   start(sec):  abhi OTP bheja gaya to turant countdown shuru karo
 *                (phir backend ka jawab aakar usse sahi kar deta hai)
 */
export function useResendCooldown(purpose, email, enabled) { 
    const [endsAt, setEndsAt] = useState(0);
    const [now, setNow] = useState(() => Date.now());
    const [checking, setChecking] = useState(false);
    const version = useRef(0); // start() call hua to usse pehle ka (late aaya) backend jawab ignore

    // Time `endsAt` se nikalte hain, har second ghata ke nahi: background tab me bhi galat nahi hota
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

    // OTP screen khulte hi backend se asli bacha hua time lo
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
                // Pooch na paye to button khula rahe: backend phir bhi galat resend rok dega
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