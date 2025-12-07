import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./lib/AuthStore";

const App = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return <main>{isAuthenticated ? <Dashboard /> : <Login />}</main>;
};

export default App;
