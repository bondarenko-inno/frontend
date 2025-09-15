import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("accessToken");
    return token ? children : <Navigate to="/auth" />;
}

function Home() {
    return (
        <div className="p-10 text-white text-3xl bg-gray-900 min-h-screen">
            🏠 Home page (protected)
            <button
                className="ml-4 px-4 py-2 rounded bg-red-600 hover:bg-red-500"
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/auth";
                }}
            >
                Log out
            </button>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                    path="/*"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
