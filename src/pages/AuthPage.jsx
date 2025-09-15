import { useState } from "react";

export default function AuthPage() {
    const [mode, setMode] = useState("login"); // login | register

    // common fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // registration only
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        let body;
        let endpoint;

        if (mode === "login") {
            endpoint = "/auth/authenticate";
            body = { email, password };
        } else {
            endpoint = "/register";
            body = {
                email,
                password,
                name,
                surname,
                birthDate: birthDate + "T00:00:00" // ISO 8601, like in your DTO
            };
        }

        const res = await fetch(`http://api.local${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            window.location.href = "/";
        } else {
            alert("Login/registration error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    {mode === "login" ? "Login" : "Register"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {mode === "register" && (
                        <>
                            <input
                                type="text"
                                placeholder="First Name"
                                className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Last Name"
                                className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                            />

                            <input
                                type="date"
                                placeholder="Birth Date"
                                className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500"
                    >
                        {mode === "login" ? "Log In" : "Register"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        className="text-sm text-blue-400 hover:underline"
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                    >
                        {mode === "login"
                            ? "Don't have an account? Register"
                            : "Already have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
