import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { apiFetch } from "../util/apiService.js";
import jwtDecode from "jwt-decode";
import { useError } from "../context/ErrorContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const { showError } = useError();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;

                const decoded = jwtDecode(token);
                const email = decoded.sub || decoded.email;

                const res = await apiFetch(`${API_BASE}/orders/orders/by-user?email=${email}`, showError);
                const data = await res.json();
                setOrders(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const toggleOrder = (id) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0).toFixed(2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-pulse">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <h1 className="text-3xl font-bold mb-6">🛒 Order History</h1>

            {orders.length === 0 ? (
                <p className="text-gray-400">No orders yet</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {[...orders].reverse().map(order => (
                        <div key={order.id} className="bg-gray-800 p-4 rounded-2xl shadow-md">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleOrder(order.id)}>
                                <div>
                                    <p className="text-lg font-semibold">Order #{order.id}</p>
                                    <p className="text-gray-400">Status: {order.orderStatus}</p>
                                    <p className="text-gray-400">User ID: {order.userId}</p>
                                    <p className="text-gray-400">Total: ${calculateTotal(order.items)}</p>
                                </div>
                                <div className="text-gray-400">
                                    {expandedOrderId === order.id ? <X size={20} /> : "+"}
                                </div>
                            </div>

                            {expandedOrderId === order.id && (
                                <div className="mt-4 bg-gray-700 p-3 rounded-xl">
                                    <h3 className="font-semibold mb-2">Order Items:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {order.items.map((item, idx) => (
                                            <li key={idx}>
                                                {item.name} — ${item.price.toFixed(2)} (x{item.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-2 font-semibold">Total: ${calculateTotal(order.items)}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
