import { Pencil } from "lucide-react";

/**
 * Shared header for auth pages/steps — icon box + title + subtitle,
 * with an optional "edit email" back-link (used in OTP/verification steps).
 */
const AuthHeader = ({ icon: Icon, title, subtitle, email, onEditEmail }) => {

    if (onEditEmail) {
        return (
            <div className="flex flex-col items-stretch justify-start gap-1 text-center">
                <div className="w-10 h-10 mx-auto rounded-[10px] bg-[#131316] flex items-center justify-center text-white mb-4">
                    <Icon className="text-sm" />
                </div>

                <h1 className="auth-header-title">{title}</h1>

                <p className="login-body text-sm text-clerk-muted-foreground text-center mt-1">
                    {subtitle}
                </p>

                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        onClick={onEditEmail}
                        className="cursor-pointer login-body flex items-center gap-1.5 text-[13px] text-clerk-muted-foreground font-medium mt-0.5 hover:underline"
                    >
                        {email}
                        <Pencil className="text-clerk-muted-foreground size-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center flex-col">
            <div className="w-10 h-10 rounded-[10px] bg-[#131316] flex items-center justify-center text-white mb-4">
                <Icon className="text-sm" />
            </div>

            <h1 className="auth-header-title">{title}</h1>

            <p className="login-body text-sm text-center mt-1 text-clerk-muted-foreground">
                {subtitle}
            </p>
        </div>
    );
};

export default AuthHeader;