


// import { useState } from "react";
// import { Eye, EyeOff, AlertCircle, CircleCheck, CircleAlert } from "lucide-react";

// // Config-driven rules — naya rule add karna ho to bas ek entry yaha add karo
// const PASSWORD_RULES = [
//     { id: "length", label: "at least 8 characters", test: (v) => v.length >= 8 },
//     { id: "letter", label: "one letter", test: (v) => /[a-zA-Z]/.test(v) },
//     // { id: "number", label: "one number", test: (v) => /[0-9]/.test(v) },
// ];

// export function isPasswordValid(value) {
//     return PASSWORD_RULES.every((rule) => rule.test(value));
// }

// const HINT_TEXT = "Your password must contain " + PASSWORD_RULES.map((r) => r.label).join(", ") + ".";

// /**
//  * Clerk-style password field — single-line hint/error, exactly like the
//  * original version, but now validating length + letter + number together.
//  *
//  * - Untouched: no message, normal border
//  * - Focused + empty: neutral gray hint, normal border
//  * - Has typed but invalid: red border, red error text + icon
//  * - Fully valid: message hides, border back to normal
//  */
// export default function PasswordField({
//     id = "password",
//     label = "Password",
//     value,
//     onChange, 
//     disabled,
//     placeholder = "Enter your password",
//     required,
//     externalError,
// }) {
//     const [touched, setTouched] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);

//     const hasTyped = value.length > 0;
//     const valid = isPasswordValid(value);
//     const isInvalidWhileTyping = hasTyped && !valid;

//     const showMessage = touched && !valid;

//     return (
//         <div>
//             <label htmlFor={id} className={`auth-label ${disabled ? "is-disabled" : ""}`}>
//                 {label}
//             </label> 

//             <div className={`clerk-input flex items-center gap-2 mt-1.5 ${isInvalidWhileTyping ? "clerk-input-error" : ""}`}>
//                 <input
//                     id={id}
//                     type={showPassword ? "text" : "password"}
//                     required={required}
//                     value={value}
//                     onChange={onChange} 
//                     onFocus={() => setTouched(true)} 
//                     disabled={disabled}
//                     placeholder={placeholder}   
//                     className="bg-transparent outline-none border-none w-full min-w-0 text-inherit placeholder:text-clerk-muted-foreground" 
//                 />
//                 <button
//                     type="button"
//                     tabIndex={-1}
//                     onClick={() => setShowPassword((s) => !s)}
//                     className="shrink-0 text-clerk-muted-foreground hover:text-(--clerk-color-foreground) transition-colors"
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//             </div>

//             {showMessage && (
//                 <p
//                     className={`mt-1.5 login-animate flex items-center gap-1 text-xs ${isInvalidWhileTyping
//                         ? "text-[color-mix(in_srgb,transparent,var(--clerk-color-danger)_80%)]"
//                         : "text-clerk-muted-foreground"
//                         }`}
//                 >
//                     {isInvalidWhileTyping && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
//                     {HINT_TEXT}
//                 </p>
//             )}

//             {externalError && !showMessage && (
//                 <p className="mt-2 login-animate flex items-end justify-start gap-1 text-xs text-(--clerk-color-danger)]">
//                     <CircleAlert size={15} /> {externalError}
//                 </p>
//             )}

//             {!externalError && !showMessage && value && (
//                 <p className="mt-2 login-animate flex items-end justify-start gap-1 text-xs text-(--clerk-color-success)]">
//                     <CircleCheck size={15} /> Your password meets all the necessary requirements.
//                 </p>
//             )

//             }
//         </div>
//     );
// }











// import { useState } from "react";
// import { Eye, EyeOff, AlertCircle, CircleCheck, CircleAlert } from "lucide-react";

// // Config-driven rules — naya rule add karna ho to bas ek entry yaha add karo
// const PASSWORD_RULES = [
//     { id: "length", label: "at least 8 characters", test: (v) => v.length >= 8 },
//     { id: "letter", label: "one letter", test: (v) => /[a-zA-Z]/.test(v) },
//     // { id: "number", label: "one number", test: (v) => /[0-9]/.test(v) },
// ];

// export function isPasswordValid(value) {
//     return PASSWORD_RULES.every((rule) => rule.test(value));
// }

// const HINT_TEXT = "Your password must contain " + PASSWORD_RULES.map((r) => r.label).join(", ") + ".";

// export default function PasswordField({
//     id = "password",
//     label = "Password",
//     value,
//     onChange,
//     disabled,
//     placeholder = "Enter your password",
//     required,
//     externalError,
//     autoComplete = "new-password",
// }) {
//     const [touched, setTouched] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);

//     const hasTyped = value.length > 0;
//     const valid = isPasswordValid(value);
//     const isInvalidWhileTyping = hasTyped && !valid;

//     const showHintOrError = touched && !valid;
//     // BUG FIX: success ab `valid` par directly depend karta hai, `!showMessage`
//     // (i.e. `!touched`) par nahi — warna untouched/autofilled invalid password
//     // par bhi "meets all requirements" dikh jaata tha.
//     const showSuccess = !externalError && valid && value.length > 0;
//     const showExternalError = externalError && !showHintOrError;

//     const messageId = `${id}-message`;

//     return (
//         <div>
//             <label htmlFor={id} className={`auth-label ${disabled ? "is-disabled" : ""}`}>
//                 {label}
//             </label>

//             <div
//                 className={`clerk-input flex items-center gap-2 mt-1.5 ${isInvalidWhileTyping ? "clerk-input-error" : ""
//                     } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
//             >
//                 <input
//                     id={id}
//                     type={showPassword ? "text" : "password"}
//                     required={required}
//                     value={value}
//                     onChange={onChange}
//                     onFocus={() => setTouched(true)}
//                     disabled={disabled}
//                     placeholder={placeholder}
//                     autoComplete={autoComplete}
//                     aria-invalid={isInvalidWhileTyping || Boolean(showExternalError)}
//                     aria-describedby={messageId}
//                     className="bg-transparent outline-none border-none w-full min-w-0 text-inherit placeholder:text-clerk-muted-foreground"
//                 />
//                 <button
//                     type="button"
//                     onClick={() => setShowPassword((s) => !s)}
//                     disabled={disabled}
//                     className="shrink-0 text-clerk-muted-foreground hover:text-(--clerk-color-foreground) transition-colors disabled:cursor-not-allowed"
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//             </div>

//             <div id={messageId} aria-live="polite">
//                 {showHintOrError && (
//                     <p
//                         className={`mt-1.5 login-animate flex items-center gap-1 text-xs ${isInvalidWhileTyping
//                             ? "text-[color-mix(in_srgb,transparent,var(--clerk-color-danger)_80%)]"
//                             : "text-clerk-muted-foreground"
//                             }`}
//                     >
//                         {isInvalidWhileTyping && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
//                         {HINT_TEXT}
//                     </p>
//                 )}

//                 {showExternalError && (
//                     // FIX: stray trailing "]" hata diya (text-(--clerk-color-danger)] galat tha)
//                     <p className="mt-2 login-animate flex items-end justify-start gap-1 text-xs text-(--clerk-color-danger)">
//                         <CircleAlert size={15} /> {externalError}
//                     </p>
//                 )}

//                 {showSuccess && !showHintOrError && (
//                     // FIX: stray trailing "]" hata diya + logic ab `valid` par based hai
//                     <p className="mt-2 login-animate flex items-end justify-start gap-1 text-xs text-(--clerk-color-success)">
//                         <CircleCheck size={15} /> Your password meets all the necessary requirements.
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// }





import { useState } from "react";
import { Eye, EyeOff, AlertCircle, CircleCheck, CircleAlert } from "lucide-react";

// Config-driven rules — naya rule add karna ho to bas ek entry yaha add karo
const PASSWORD_RULES = [
    { id: "length", label: "at least 8 characters", test: (v) => v.length >= 8 },
    { id: "letter", label: "one letter", test: (v) => /[a-zA-Z]/.test(v) },
    // { id: "number", label: "one number", test: (v) => /[0-9]/.test(v) },
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
    // const [touched, setTouched] = useState(false);
    // const [showPassword, setShowPassword] = useState(false);

    // const hasTyped = value.length > 0;
    // const valid = isPasswordValid(value);
    // const isInvalidWhileTyping = hasTyped && !valid;

    // const showHintOrError = touched && !valid;
    // // BUG FIX: success ab `valid` par directly depend karta hai, `!showMessage`
    // // (i.e. `!touched`) par nahi — warna untouched/autofilled invalid password
    // // par bhi "meets all requirements" dikh jaata tha.
    // const showSuccess = !externalError && valid && value.length > 0;
    // const showExternalError = externalError && !showHintOrError;

    const messageId = `${id}-message`;

    const [showPassword, setShowPassword] = useState(false);
    const [showHint, setShowHint] = useState(false); 
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        onChange(e)
        if (isPasswordValid(e.target.value)) {  
            setShowSuccess(true)
            setShowHint(false);
        } else {
            setShowSuccess(false);
            setShowHint(true);
        }
    }

    const handleFocus = () => {
        if (!showSuccess) {
            setShowHint(true);
        }
        setShowError(false);
    }

    const handleBlur = () => {
        setShowHint(false)

        if (!isPasswordValid(value) || !value || externalError) {
            setShowError(true)
        }
    }

    return (
        <div>
            <label htmlFor={id} className={`auth-label ${disabled ? "is-disabled" : ""}`}>
                {label}
            </label>

            {/* <div
                className={`clerk-input flex items-center gap-2 mt-1.5 
                    ${showError ? "clerk-input-error" : ""} 
                    ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
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
                    className="bg-transparent outline-none border-none w-full min-w-0 text-inherit placeholder:text-clerk-muted-foreground"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={disabled}
                    className="shrink-0 text-clerk-muted-foreground hover:text-(--clerk-color-foreground) transition-colors disabled:cursor-not-allowed"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div> */}


            {/* <div 
                className={`clerk-input flex items-center gap-2 mt-1.5 
                    ${showError ? "clerk-input-error" : ""} 
                    ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            > */}
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
                        ${showError ? "clerk-input-error" : ""} 
                        ${showSuccess ? "clerk-input-success" : ""} 
                        ${disabled ? "opacity-60 cursor-not-allowed" : ""} 
                    `}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={disabled}
                    className="absolute mt-0 mb-0 ml-0 mr-4 right-0  shrink-0 text-clerk-muted-foreground hover:text-(--clerk-color-foreground) transition-colors disabled:cursor-not-allowed"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <div id={messageId} style={{ height: (showHint || showError || showSuccess) ? "44px" : "0px", transition: "height .3 ease-in-out" }} aria-live="polite">
                {showHint && (
                    <p
                        className={`mt-2 login-animate flex items-center gap-1 text-xs text-clerk-muted-foreground`}
                    >
                        {HINT_TEXT}
                    </p>
                )}

                {(showError || externalError) && (
                    <p className="mt-2 flex items-start justify-start gap-1 clerk-error-msg">
                        <CircleAlert size={15} /> {externalError ? externalError : HINT_TEXT}
                    </p>
                )}

                {showSuccess && !showError && ( 
                    <p className="mt-2 login-animate flex items-end justify-start gap-1 text-xs text-(--clerk-color-success)">
                        <CircleCheck size={15} /> Your password meets all the necessary requirements.
                    </p>
                )}
            </div>
        </div>
    );
}