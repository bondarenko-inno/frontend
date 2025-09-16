import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { refreshToken, logout } from "../util/tokenService.js";

export default function PrivateRoute({ children }) {
    const [authorized, setAuthorized] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem("accessToken");
            const refreshTokenValue = localStorage.getItem("refreshToken");

            if (accessToken) {
                setAuthorized(true);
            } else if (refreshTokenValue) {
                try {
                    await refreshToken();
                    setAuthorized(true);
                } catch {
                    logout();
                    setAuthorized(false);
                }
            } else {
                setAuthorized(false);
            }
        };
        checkAuth();
    }, []);

    if (authorized === null)
        return <div className="text-white flex justify-center items-center h-screen">Loading...</div>;

    return authorized ? children : <Navigate to="/auth" />;
}
