import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/AuthPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import HomePage from "./pages/HomePage.jsx";

import { ErrorProvider } from "./context/ErrorContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import ErrorModal from "./components/ErrorModal.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
    return (
        <ErrorProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                    <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
                    <Route path="/order-history" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>

            <ErrorModal />
        </ErrorProvider>
    );
}
