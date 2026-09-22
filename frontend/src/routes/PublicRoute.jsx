import React from 'react'
import { useAuthStore } from '../store/authStore.js'
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {

    const isAuthenticated = useAuthStore(state => state.isAuthenticated); 

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />; 

}

export default PublicRoute; 