import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { loginService } from "@/service/login";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const loginMutation = loginService();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() && password.trim()) {
            setIsLoading(true);
            try {
                await loginMutation.mutateAsync({ username, password });
            } catch {}

            setIsLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    };

    const logoVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                delay: 0.2,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    };

    const formItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                delay: 0.4 + i * 0.1,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        }),
    };

    const inputVariants = {
        focus: {
            y: -2,
            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
            transition: { duration: 0.3 },
        },
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-lg shadow-lg p-8 space-y-6 relative overflow-hidden"
                >
                    {/* Background shimmer effect */}
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background:
                                "linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)",
                        }}
                        animate={{
                            x: ["-100%", "100%"],
                            y: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {/* Logo */}
                    <motion.div
                        className="flex justify-center mb-8 relative z-10"
                        variants={logoVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.img
                            src="/logo.png"
                            alt="Growatt Logo"
                            className="h-20 w-auto object-contain"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-4 relative z-10"
                    >
                        {/* Username Field */}
                        <motion.div
                            className="space-y-2"
                            variants={formItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                        >
                            <Label htmlFor="username" className="text-gray-500">
                                Username
                            </Label>
                            <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                            >
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="focus-visible:ring-green-500 hover:border-green-400 py-5"
                                    placeholder="Enter your username"
                                    required
                                />
                            </motion.div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            className="space-y-2"
                            variants={formItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                        >
                            <Label htmlFor="password" className="text-gray-500">
                                Password
                            </Label>
                            <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                            >
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="focus-visible:ring-green-500 hover:border-green-400 py-5"
                                    placeholder="Enter your password"
                                    required
                                />
                            </motion.div>
                        </motion.div>

                        {/* Login Button */}
                        <motion.div
                            className="pt-2"
                            variants={formItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-green-400 rounded-md opacity-0"
                                    whileHover={{
                                        opacity: [0, 0.3, 0],
                                        scale: [1, 1.5, 1.5],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
