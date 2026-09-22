// /**
//  * Shared label + input field for auth forms (Login, Register, ForgotPassword).
//  * One place controls both the label style and the input style — no more
//  * copy-pasting the label className template literal into every form field.
//  */
// const AuthField = ({
//     id,
//     label,
//     type = "text",
//     value,
//     onChange,
//     disabled = false,
//     required = false, 
//     placeholder,  
// }) => {
//     return (
//         <div className="flex flex-col items-stretch justify-start gap-2"> 

//             <label htmlFor={id} className={`auth-label ${disabled ? "is-disabled" : ""}`}> 
//                 {label} 
//             </label>

//             <input
//                 type={type}
//                 id={id}
//                 name={id}
//                 required={required}
//                 disabled={disabled}
//                 value={value}
//                 onChange={onChange} 
//                 className="clerk-input" 
//                 placeholder={placeholder}
//             />
//         </div>
//     );
// };

// export default AuthField;








/**
 * Shared label + input field for auth forms (Login, Register, ForgotPassword).
 * One place controls both the label style and the input style — no more
 * copy-pasting the label className template literal into every form field.
 */
const AuthField = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    disabled = false,
    required = false, 
    placeholder,
    error,
}) => {
    return (
        <div className="flex flex-col items-stretch justify-start gap-2">

            <label htmlFor={id} className={`auth-label ${disabled ? "is-disabled" : ""}`}>
                {label}
            </label>
 
            <input
                type={type}
                id={id}
                name={id}
                required={required} 
                disabled={disabled}
                value={value}
                onChange={onChange}
                className={`clerk-input ${error ? "clerk-input-error" : ""}  `}
                placeholder={placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />

            {error && (
                <p id={`${id}-error`} className="clerk-error-msg"> 
                    {error} 
                </p>
            )}
        </div>
    );
};

export default AuthField;