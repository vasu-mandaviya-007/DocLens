
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
    autoComplete,
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
                autoComplete={autoComplete}
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