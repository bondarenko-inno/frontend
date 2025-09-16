import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { apiFetch, API_BASE } from "../util/apiService.js";
import { useError } from "../context/ErrorContext.jsx";

export default function MyOrders() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { showError } = useError();

    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCartItems(storedItems);
    }, []);

    const handleQuantityChange = (id, val) => {
        const newQuantity = val === "" ? "" : Math.max(1, Math.min(Number(val), cartItems.find(item => item.id === id)?.availableQuantity || 1));
        const updated = cartItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item);
        setCartItems(updated);
        localStorage.setItem("cartItems", JSON.stringify(updated));
    };

    const handleRemove = (id) => {
        const updated = cartItems.filter(item => item.id !== id);
        setCartItems(updated);
        localStorage.setItem("cartItems", JSON.stringify(updated));
    };

    const handlePlaceOrder = async () => {
        const orderRequest = {
            items: cartItems.map(item => ({ itemId: item.id, quantity: item.quantity }))
        };

        try {
            const res = await apiFetch(`${API_BASE}/orders/orders`, {
                method: "POST",
                body: JSON.stringify(orderRequest)
            }, showError);

            await res.json();
            localStorage.removeItem("cartItems");
            setCartItems([]);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (cartItems.length === 0 && !showSuccessModal) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <p className="text-xl mb-4">Your cart is empty</p>
                <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded" onClick={() => navigate("/")}>
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10">
            <h1 className="text-3xl mb-6">🛒 Cart</h1>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
                <ArrowLeft size={20} />
                Back
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cartItems.map(item => (
                    <div key={item.id} className="bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">{item.name}</h2>
                            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-400">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-gray-400 mb-2">Price: ${item.price.toFixed(2)}</p>
                        <p className="text-gray-400 mb-2">Available: {item.availableQuantity}</p>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                        />
                    </div>
                ))}
            </div>

            {cartItems.length > 0 && (
                <button className="mt-6 w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded font-semibold" onClick={handlePlaceOrder}>
                    Place Order
                </button>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md text-center relative">
                        <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={() => { setShowSuccessModal(false); navigate("/profile"); }}>
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-green-400 mb-4">✅ Order successfully placed!</h2>
                        <p className="text-gray-300 mb-6">You can check the order status in the <b>"order history"</b> tab.</p>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded font-semibold" onClick={() => { setShowSuccessModal(false); navigate("/order-history"); }}>
                            Go to Order History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
