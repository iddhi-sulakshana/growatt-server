import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    return (
        <main>
            {isLoggedIn ? (
                <Dashboard />
            ) : (
                <Login onLogin={() => setIsLoggedIn(true)} />
            )}
        </main>
    );
};

export default App;
