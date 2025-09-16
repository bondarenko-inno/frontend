const API_BASE = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
}

export async function refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    if (isRefreshing) {
        return new Promise((resolve) => {
            refreshSubscribers.push(resolve);
        });
    }

    isRefreshing = true;

    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh token invalid");

        const tokens = await res.json();
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);

        onRefreshed(tokens.accessToken);
        return tokens.accessToken;
    } finally {
        isRefreshing = false;
    }
}

export function logout() {
    localStorage.clear();
    window.location.href = "/auth";
}
