import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import { useAuthStore } from "./lib/AuthStore";

const App = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // If not authenticated, show login page for all routes
    if (!isAuthenticated) {
        return <Login />;
    }

    // If authenticated, show routes
    return (
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default App;
