import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useError } from "../context/ErrorContext.jsx";
import { apiFetch, API_BASE } from "../util/apiService.js";
import { X } from "lucide-react";

export default function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const { showError } = useError();

    const validate = () => {
        const newErrors = {};

        if (!email.trim()) newErrors.email = "Enter email";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email";

        if (!password.trim()) newErrors.password = "Enter password";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (mode === "register") {
            if (!name.trim()) newErrors.name = "Enter first name";
            if (!surname.trim()) newErrors.surname = "Enter last name";

            if (!birthDate) newErrors.birthDate = "Select birth date";
            else {
                const selectedDate = new Date(birthDate);
                const today = new Date();
                if (selectedDate > today) newErrors.birthDate = "Birth date cannot be in the future";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        let body, endpoint;
        if (mode === "login") {
            endpoint = "/auth/authenticate";
            body = { email, password };
        } else {
            endpoint = "/auth/register";
            body = {
                email,
                password,
                name,
                surname,
                birthDate: birthDate + "T00:00:00"
            };
        }

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || `Error ${res.status}`);
            }

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            navigate("/");
        } catch (err) {
            showError(err.message);
            console.error("Direct fetch error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    {mode === "login" ? "Login" : "Register"}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {mode === "register" && (
                        <>
                            <div>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                                    value={surname}
                                    onChange={e => setSurname(e.target.value)}
                                />
                                {errors.surname && <p className="text-red-400 text-sm mt-1">{errors.surname}</p>}
                            </div>

                            <div>
                                <label className="block mb-1 text-sm text-gray-300">Birth Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
                                />
                                {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>}
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 transition"
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

            {serverError && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-red-600 p-6 rounded-2xl shadow-lg text-center">
                        <p className="text-white font-bold">{serverError}</p>
                        <button
                            className="mt-4 px-4 py-2 bg-white text-red-600 rounded"
                            onClick={() => setServerError("")}
                        >
                            Ok
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
