import { useState } from "react";
import { Button } from "../components/ui/button";
import logo from "../assets/logo.png";

interface LoginProps {
    onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() && password.trim()) {
            onLogin();
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <img
                            src={logo}
                            alt="Growatt Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                Login
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
