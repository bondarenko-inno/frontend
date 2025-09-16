import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShoppingCart, X, CheckCircle } from "lucide-react";
import { apiFetch } from "../util/apiService.js";
import { logout } from "../util/tokenService.js";

export default function HomePage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/items`)
            .then(res => res.json())
            .then(data => { setItems(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const handleOrderClick = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        setShowModal(true);
    };

    const handleAddToCart = () => {
        if (quantity < 1) return;

        const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const idx = cart.findIndex(ci => ci.id === selectedItem.id);

        const cartItem = { ...selectedItem, quantity, availableQuantity: selectedItem.quantity };
        if (idx !== -1) cart[idx].quantity += quantity;
        else cart.push(cartItem);

        localStorage.setItem("cartItems", JSON.stringify(cart));
        setShowModal(false);
        setSuccessMessage(`${quantity} pcs of ${selectedItem.name} added to cart`);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="bg-gray-800 px-6 py-3 flex items-center justify-between shadow-md">
                <div className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
                    🛒 Innowise-shop
                </div>
                <nav className="space-x-6 text-lg">
                    <button className="hover:text-blue-400" onClick={() => navigate("/orders")}>Cart</button>
                    <button className="hover:text-blue-400" onClick={() => navigate("/profile")}>Profile</button>
                    <button className="hover:text-blue-400" onClick={() => navigate("/order-history")}>Order History</button>
                </nav>
                <button
                    className="p-2 rounded-full bg-red-600 hover:bg-red-500 transition flex items-center justify-center"
                    onClick={logout}
                    title="Log out"
                >
                    <LogOut size={20} />
                </button>
            </header>

            <main className="flex-grow p-10">
                <h1 className="text-3xl mb-6">🏠 Available Items</h1>
                {loading ? (
                    <div className="animate-pulse">Loading...</div>
                ) : items.length === 0 ? (
                    <p>No available items</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col justify-between">
                                <h2 className="text-xl font-bold mb-2">{item.name}</h2>
                                <p>Price: ${item.price.toFixed(2)}</p>
                                <p>Available: {item.quantity}</p>
                                <button
                                    className="mt-auto bg-blue-600 hover:bg-blue-500 py-2 rounded flex items-center justify-center gap-2"
                                    onClick={() => handleOrderClick(item)}
                                >
                                    <ShoppingCart size={16} /> Order
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                            onClick={() => setShowModal(false)}
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Select Quantity</h2>
                        <p className="mb-4">Item: <b>{selectedItem?.name}</b></p>
                        <input
                            type="number"
                            min="1"
                            max={selectedItem?.quantity || 1}
                            value={quantity === 0 ? "" : quantity}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") setQuantity(0);
                                else setQuantity(Math.min(Math.max(Number(val), 1), selectedItem?.quantity || 1));
                            }}
                            className="w-full p-2 rounded bg-gray-700 text-white mb-4"
                        />
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded"
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center animate-fade-in">
                        <CheckCircle size={40} className="mb-2" />
                        <p className="text-lg font-semibold">{successMessage}</p>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="mt-4 px-4 py-2 bg-white text-green-700 font-bold rounded-lg hover:bg-gray-200 transition"
                        >
                            Ok
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
