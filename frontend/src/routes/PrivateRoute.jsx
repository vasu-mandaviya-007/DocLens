import React from 'react'
import { useAuthStore } from '../store/authStore.js'
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {

    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return isAuthenticated ? <Outlet /> : <Navigate to={"/login"} replace />;

}

export default PrivateRoute;