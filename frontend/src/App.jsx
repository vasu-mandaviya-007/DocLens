import React, { useEffect } from 'react'
import DocumentQA from './pages/DocumentQA.jsx'
import Home from './pages/Home.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from './pages/LoginPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import { useAuthStore } from './store/authStore.js';
import { Loader2 } from 'lucide-react';
import PublicRoute from './routes/PublicRoute.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { useAppStore } from './store/appStore.js';
import NotebookViewPage from './pages/NotebookViewPage.jsx';

const App = () => {

    const fetchUser = useAuthStore(state => state.fetchUser);
    const loading = useAuthStore(state => state.authLoading);
    const isCreatingNotebook = useAppStore(state => state.isCreatingNotebook);


    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (loading) {
        return (
            <div className="h-screen w-screen select-none flex flex-col items-center justify-center bg-surface-default transition-colors duration-300">
                <div className="relative flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-accent-500" size={38} strokeWidth={2.5} />
                    <div className="flex flex-col items-center">
                        <p className="text-slate-800 dark:text-slate-100 text-2xl font-extrabold tracking-tight">
                            DocLens
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-1 animate-pulse">
                            Loading Your Notebooks...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isCreatingNotebook) { 
        return (
            <div className="h-screen w-screen select-none flex flex-col items-center justify-center bg-surface-default transition-colors duration-300">
                <div className="relative flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-accent-500" size={50} strokeWidth={2.5} /> 
                    <div className="flex flex-col items-center">
                        <p className="text-slate-500 dark:text-slate-400 text-base font-bold uppercase tracking-[0.2em] mt-1 animate-pulse">
                            Creating Your Notebook...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (

        <BrowserRouter>

            <Routes>

                <Route element={<PrivateRoute />} >
                    <Route path='' element={<Home />} />
                    <Route path='/notebook/:notebook_id' element={<NotebookViewPage />} />
                    <Route path='/profile' element={<ProfilePage />} />
                </Route>


                <Route element={<PublicRoute />} >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/register" element={<Register />} />
                </Route>

            </Routes>

        </BrowserRouter>

    )

}

export default App;