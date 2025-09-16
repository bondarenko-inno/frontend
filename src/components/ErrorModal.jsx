import { useError } from "../context/ErrorContext.jsx";
import { X } from "lucide-react";

export default function ErrorModal() {
    const { error, hideError } = useError();

    if (!error) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md relative text-center text-white">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                    onClick={hideError}
                >
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-4">❌ Error</h2>
                <p className="mb-2">{error.message}</p>
                {error.status && <p className="text-gray-400">Status: {error.status}</p>}
                <button
                    className="mt-4 bg-blue-600 hover:bg-blue-500 py-2 px-4 rounded"
                    onClick={hideError}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
