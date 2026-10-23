
import { useEffect, useRef } from "react";

const CustomOtpInput = ({ value, onChange, length = 6, disabled = false, error, onFilled }) => {
    const inputRefs = useRef([]);
    const digits = Array.from({ length }, (_, i) => value[i] || "");

    const focusInput = (index) => {
        const el = inputRefs.current[index];
        if (el) {
            el.focus();
            el.select();
        }
    };

    useEffect(() => {
        if (!disabled && value === "") focusInput(0);
    }, [value, disabled]);

    const updateValue = (newDigits) => {
        const next = newDigits.join("").slice(0, length);
        onChange(next);
        if (next.length === length) onFilled?.(next);
    };

    const handleChange = (e, index) => {
        const char = e.target.value.replace(/\D/g, "").slice(-1);
        const newDigits = [...digits];

        if (!char) {
            newDigits[index] = "";
            updateValue(newDigits);
            return;
        }

        newDigits[index] = char;
        updateValue(newDigits);

        if (index < length - 1) {
            focusInput(index + 1);
        } else {
            inputRefs.current[index]?.blur();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newDigits = [...digits];
            if (digits[index]) {
                newDigits[index] = "";
                updateValue(newDigits);
            } else if (index > 0) {
                newDigits[index - 1] = "";
                updateValue(newDigits);
                focusInput(index - 1);
            }
            return;
        }
        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            focusInput(index - 1);
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault();
            focusInput(index + 1);
        }
    };

    const handlePaste = (e, index) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!pasted) return;

        const newDigits = [...digits];
        let cursor = index;
        for (let i = 0; i < pasted.length && cursor < length; i++) {
            newDigits[cursor] = pasted[i];
            cursor++;
        }
        updateValue(newDigits);
        focusInput(Math.min(cursor, length - 1));
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 sm:gap-2.5 justify-center w-full">
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        disabled={disabled}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={(e) => handlePaste(e, index)}
                        onFocus={(e) => e.target.select()}
                        className={`clerk-otp-input ${error ? "error" : ""}`}
                    />
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-1.5 mt-1 animate-field-fade-up">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#EF4444" />
                        <path d="M10 5.5v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="10" cy="13.5" r="1" fill="white" />
                    </svg>
                    <span className="login-body text-sm font-medium text-danger">{error}</span>
                </div>
            )}
        </div>
    );
};

export default CustomOtpInput;








