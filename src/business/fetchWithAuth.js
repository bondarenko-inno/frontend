export async function fetchWithAuth(url, options = {}) {
    let accessToken = localStorage.getItem("accessToken");

    let res = await fetch(`http://localhost:8080${url}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (res.status === 401) {
        // пробуем refresh
        const refreshToken = localStorage.getItem("refreshToken");
        const refreshRes = await fetch("http://localhost:8080/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("accessToken", data.accessToken);

            // повторяем запрос
            res = await fetch(`http://localhost:8080${url}`, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${data.accessToken}`,
                },
            });
        } else {
            localStorage.clear();
            window.location.href = "/auth";
        }
    }

    return res;
}
