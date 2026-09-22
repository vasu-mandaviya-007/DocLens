
import { useEffect, useState } from "react"; 
import { Loader2 } from "lucide-react";
import { GitHubIcon, GoogleIcon } from "../common/Icons.jsx"; 

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth` || "http://localhost:8000/api/auth";


const OAuthButtons = ({ mode = "login", redirectPath, loading, googleLoading, setGoogleLoading, githubLoading, setGithubLoading }) => {

    const handleGoogle = () => {
        setGoogleLoading(true);
        sessionStorage.setItem("oauth_flow_active", "1");
        sessionStorage.setItem("post_login_redirect", redirectPath);
        window.location.href = `${BASE_URL}/google`;
    };

    const handleGitHub = () => {
        setGithubLoading(true);
        sessionStorage.setItem("oauth_flow_active", "1"); 
        sessionStorage.setItem("post_login_redirect", redirectPath);
        window.location.href = `${BASE_URL}/github`;
    };


    return (
        <div className="flex gap-2.5 w-full">
            <button
                onClick={handleGoogle}
                disabled={loading || googleLoading || githubLoading} 
                className="oauth-button dark:bg-[#eee]! dark:text-black!" 
            >
                <div>
                    {googleLoading ? <Loader2 size={16} className="animate-spin-fast text-gray-500" /> : <GoogleIcon />}
                    <span>Google</span> 
                </div>
            </button> 

            <button
                onClick={handleGitHub} 
                disabled={loading || googleLoading || githubLoading} 
                className="oauth-button bg-gray-900! dark:bg-gray-950! hover:bg-black! text-white!"
            >
                <div>
                    {githubLoading ? <Loader2 size={16} className="animate-spin-fast text-gray-500" /> : <GitHubIcon />}
                    <span>GitHub</span>
                </div>
            </button>
        </div>
    );
};

export default OAuthButtons;