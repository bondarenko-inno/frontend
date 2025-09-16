import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { CreditCard, User, X, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { apiFetch } from "../util/apiService.js";
import { useError } from "../context/ErrorContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cards, setCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [newCard, setNewCard] = useState({ number: "", holder: "", expirationDate: "" });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { showError } = useError();

    const validateExpiry = (value) => {
        if (!/^\d{2}\/\d{2}$/.test(value)) return false;
        const [month, year] = value.split("/").map(Number);
        if (month < 1 || month > 12) return false;
        const now = new Date();
        const expiry = new Date(2000 + year, month);
        return expiry > now;
    };

    useEffect(() => {
        const fetchUserAndCards = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;

                const decoded = jwtDecode(token);
                const email = decoded.sub || decoded.email;

                const userRes = await apiFetch(`${API_BASE}/users/users/by-email?email=${email}`, showError);
                const userData = await userRes.json();
                setUser(userData);

                if (userData.id) {
                    const cardsRes = await apiFetch(`${API_BASE}/users/cards/by-user/${userData.id}`, showError);
                    const cardsData = await cardsRes.json();
                    setCards(cardsData);

                    const savedPrimary = localStorage.getItem("primaryCardId");
                    if (savedPrimary && cardsData.some(c => c.id === Number(savedPrimary))) {
                        setSelectedCardId(Number(savedPrimary));
                    } else if (cardsData.length > 0) {
                        setSelectedCardId(cardsData[0].id);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchUserAndCards();
    }, []);

    const handleSaveCard = async () => {
        if (!user) return;

        const url = editingCard
            ? `${API_BASE}/users/cards/${editingCard.id}`
            : `${API_BASE}/users/cards`;
        const method = editingCard ? "PUT" : "POST";

        try {
            const [month, year] = newCard.expirationDate.split("/");
            const expirationDate = `${20}${year}-${month.padStart(2, "0")}-01T00:00:00.121Z`;

            const payload = {
                ...newCard,
                number: newCard.number.replace(/\s/g, ""),
                expirationDate,
                userId: user.id
            };

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            }, showError);

            const savedCard = await res.json();

            if (editingCard) {
                setCards(cards.map(c => (c.id === savedCard.id ? savedCard : c)));
            } else {
                setCards([...cards, savedCard]);
            }

            setSelectedCardId(savedCard.id);
            localStorage.setItem("primaryCardId", savedCard.id);
            setShowModal(false);
            setEditingCard(null);
            setNewCard({ number: "", holder: "", expirationDate: "" });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCard = async (id) => {
        try {
            await apiFetch(`${API_BASE}/users/cards/${id}`, { method: "DELETE" }, showError);
            setCards(cards.filter(c => c.id !== id));

            if (selectedCardId === id) {
                setSelectedCardId(cards.length > 1 ? cards[0].id : null);
                if (cards.length > 1) localStorage.setItem("primaryCardId", cards[0].id);
                else localStorage.removeItem("primaryCardId");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (card) => {
        setEditingCard(card);
        setNewCard({
            number: card.number.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim(),
            holder: card.holder,
            expirationDate: card.expirationDate ? new Date(card.expirationDate).toISOString().slice(5, 7) + "/" + new Date(card.expirationDate).getFullYear().toString().slice(2) : ""
        });
        setShowModal(true);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-lg animate-pulse">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex justify-center py-10 px-4">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <User size={32} className="text-blue-400" />
                    <h1 className="text-3xl font-bold">Profile</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-700 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">First Name</p>
                        <p className="text-lg font-semibold">{user.name}</p>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Last Name</p>
                        <p className="text-lg font-semibold">{user.surname}</p>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-4 col-span-2">
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-lg font-semibold">{user.email}</p>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Birth Date</p>
                        <p className="text-lg font-semibold">{new Date(user.birthDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-4 col-span-2">
                        <p className="text-gray-400 text-sm">Payment Methods</p>
                        {cards.length > 0 ? (
                            <div className="flex flex-col gap-2 mt-2">
                                {cards.map(card => (
                                    <div
                                        key={card.id}
                                        className={`flex items-center justify-between bg-gray-600 rounded p-2 cursor-pointer
        ${selectedCardId === card.id ? "bg-blue-700" : ""}`}
                                        onClick={() => {
                                            setSelectedCardId(card.id);
                                            localStorage.setItem("primaryCardId", card.id);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="primaryCard"
                                                checked={selectedCardId === card.id}
                                                onChange={() => {
                                                    setSelectedCardId(card.id);
                                                    localStorage.setItem("primaryCardId", card.id);
                                                }}
                                            />
                                            <span>**** **** **** {card.number.slice(-4)} — {card.holder}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-yellow-400 hover:text-yellow-300" onClick={() => openEditModal(card)}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="text-red-400 hover:text-red-300" onClick={() => setConfirmDelete({ id: card.id, holder: card.holder })}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        ) : (
                            <p className="text-red-400 font-semibold mt-2">No cards</p>
                        )}
                    </div>
                </div>

                <button
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition flex items-center justify-center gap-2 text-lg font-semibold"
                    onClick={() => setShowModal(true)}
                >
                    <CreditCard size={20} />
                    {editingCard ? "Edit Card" : "Add Payment Method"}
                </button>

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md relative">
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                                onClick={() => { setShowModal(false); setEditingCard(null); }}
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold mb-4">
                                {editingCard ? "Edit Card" : "Add Card"}
                            </h2>
                            <div className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Card Number"
                                    maxLength="19"
                                    className={`p-2 rounded bg-gray-700 text-white tracking-widest text-lg 
            ${newCard.number.replace(/\s/g, "").length !== 16 ? "border border-red-500" : ""}`}
                                    value={newCard.number}
                                    onChange={e => {
                                        let value = e.target.value.replace(/\D/g, "");
                                        value = value.replace(/(.{4})/g, "$1 ").trim();
                                        setNewCard({ ...newCard, number: value });
                                    }}
                                />
                                {newCard.number.replace(/\s/g, "").length !== 16 && (
                                    <p className="text-red-400 text-sm">Enter a 16-digit card number</p>
                                )}

                                <input
                                    type="text"
                                    placeholder="Card Holder Name"
                                    className={`p-2 rounded bg-gray-700 text-white uppercase
            ${!/^[A-Z ]{2,}$/.test(newCard.holder) ? "border border-red-500" : ""}`}
                                    value={newCard.holder}
                                    onChange={e => setNewCard({ ...newCard, holder: e.target.value.toUpperCase() })}
                                />
                                {!/^[A-Z ]{2,}$/.test(newCard.holder) && newCard.holder.length > 0 && (
                                    <p className="text-red-400 text-sm">Enter name in Latin letters (min 2 characters)</p>
                                )}

                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    className={`p-2 rounded bg-gray-700 text-white tracking-widest
            ${!validateExpiry(newCard.expirationDate) ? "border border-red-500" : ""}`}
                                    value={newCard.expirationDate}
                                    onChange={e => {
                                        let value = e.target.value.replace(/\D/g, "");
                                        if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                                        setNewCard({ ...newCard, expirationDate: value });
                                    }}
                                />
                                {!validateExpiry(newCard.expirationDate) && newCard.expirationDate.length > 0 && (
                                    <p className="text-red-400 text-sm">Invalid date</p>
                                )}

                                <button
                                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-semibold disabled:opacity-50"
                                    onClick={handleSaveCard}
                                    disabled={
                                        newCard.number.replace(/\s/g, "").length !== 16 ||
                                        !/^[A-Z ]{2,}$/.test(newCard.holder) ||
                                        !validateExpiry(newCard.expirationDate)
                                    }
                                >
                                    {editingCard ? "Save Changes" : "Add"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {confirmDelete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm text-center">
                            <p className="text-white text-lg mb-6">
                                Are you sure you want to delete card {confirmDelete.holder} **** {cards.find(c => c.id === confirmDelete.id)?.number.slice(-4)}?
                            </p>
                            <div className="flex justify-between gap-4">
                                <button
                                    className="w-1/2 py-2 rounded-xl bg-gray-600 hover:bg-gray-500 text-white"
                                    onClick={() => setConfirmDelete(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white"
                                    onClick={async () => {
                                        await handleDeleteCard(confirmDelete.id);
                                        setConfirmDelete(null);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
