import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl font-bold mb-4">404</h1>
            <p className="text-xl mb-6">Page not found</p>
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-semibold"
            >
                <ArrowLeft size={20} /> Return to Home
            </button>
        </div>
    );
}
