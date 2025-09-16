import { refreshToken, logout } from "./tokenService.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(url, options = {}, errorHandler) {
    let accessToken = localStorage.getItem("accessToken");
    const isRefreshRequest = url.includes("/auth/refresh");

    const headers = {
        ...(options.headers || {}),
        ...(isRefreshRequest ? {} : { Authorization: `Bearer ${accessToken}` }),
        "Content-Type": "application/json",
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && !isRefreshRequest) {
        try {
            const newAccessToken = await refreshToken();
            const retryHeaders = {
                ...(options.headers || {}),
                Authorization: `Bearer ${newAccessToken}`,
                "Content-Type": "application/json",
            };
            response = await fetch(url, { ...options, headers: retryHeaders });
        } catch (err) {
            logout();
            throw err;
        }
    }

    if (!response.ok) {
        let errMsg = `Error ${response.status}`;
        try {
            const data = await response.json();
            if (data?.message) errMsg = data.message;
        } catch { /* empty */ }
        if (errorHandler) errorHandler(errMsg, response.status);
        throw new Error(errMsg);
    }

    return response;
}

export { API_BASE };
