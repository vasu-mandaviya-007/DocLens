import { useState } from "react";
import { Eye, EyeOff, CircleCheck, CircleAlert } from "lucide-react";


const PASSWORD_RULES = [
    { id: "length", label: "at least 8 characters", test: (v) => v.length >= 8 },
    { id: "letter", label: "one letter", test: (v) => /[a-zA-Z]/.test(v) },
];

export function isPasswordValid(value) {
    return PASSWORD_RULES.every((rule) => rule.test(value));
}

const HINT_TEXT = "Your password must contain " + PASSWORD_RULES.map((r) => r.label).join(", ") + ".";


export default function PasswordField({
    id = "password",
    label = "Password",
    value,
    validation = true,
    onChange,
    disabled,
    placeholder = "Enter your password",
    required,
    externalError,
    autoComplete = "new-password",
}) {
    const messageId = `${id}-message`;

    const [showPassword, setShowPassword] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        onChange(e);
        if (!validation) return;

        const valid = isPasswordValid(e.target.value);
        setShowSuccess(valid);
        setShowHint(!valid);
    };

    const handleFocus = () => {
        if (validation && !showSuccess) setShowHint(true);
        setShowError(false);
    };

    const handleBlur = () => {
        setShowHint(false);
        if (validation && !isPasswordValid(value)) setShowError(true);
    };

    const hasMessage = showHint || showError || showSuccess || Boolean(externalError);

    return (
        <div>
            <label htmlFor={id} className={`auth-label ${disabled ? "is-disabled" : ""}`}>
                {label}
            </label>

            <div className="relative flex flex-col items-stretch justify-center mt-1.5">
                <input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    required={required}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    aria-invalid={showError || Boolean(externalError)}
                    aria-describedby={messageId}
                    className={`
                        clerk-input bg-transparent outline-none border-none w-full min-w-0 text-inherit placeholder:text-clerk-muted-foreground
                        ${showError || externalError ? "clerk-input-error" : ""}
                        ${showSuccess && !externalError ? "clerk-input-success" : ""}
                        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
                    `}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={disabled}
                    className="absolute mt-0 mb-0 ml-0 mr-4 right-0 shrink-0 text-clerk-muted-foreground hover:text-(--clerk-color-foreground) transition-colors disabled:cursor-not-allowed"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <div
                id={messageId}
                style={{ height: hasMessage ? "44px" : "0px", transition: "height .3s ease-in-out" }}
                aria-live="polite"
            >
                {showHint && (
                    <p className="mt-2 login-animate flex items-center gap-1 text-xs text-clerk-muted-foreground">
                        {HINT_TEXT}
                    </p>
                )}

                {(showError || externalError) && (
                    <p className="mt-2 flex items-start justify-start gap-1 clerk-error-msg">
                        <CircleAlert size={15} /> {externalError || HINT_TEXT}
                    </p>
                )}

                {showSuccess && !showError && !externalError && (
                    <p className="mt-2 login-animate flex items-end justify-start gap-1 text-xs text-(--clerk-color-success)">
                        <CircleCheck size={15} /> Your password meets all the necessary requirements.
                    </p>
                )}
            </div>
        </div>
    );
}