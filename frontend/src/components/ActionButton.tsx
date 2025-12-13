import { useState } from "react";
import { useAuthStore } from "@/lib/AuthStore";
import { Button } from "./ui/button";
import { LogOut, Menu, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ActionButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);

    const menuItems = [
        {
            icon: Settings,
            label: "Settings",
            onClick: () => {
                // Add settings action here
                console.log("Settings clicked");
                setIsOpen(false);
            },
            variant: "outline" as const,
        },
        {
            icon: LogOut,
            label: "Logout",
            onClick: () => {
                logout();
                setIsOpen(false);
            },
            variant: "destructive" as const,
        },
    ];

    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            {/* Main menu button */}
            <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <Button
                    className="rounded-full aspect-square p-5 min-w-[56px] min-h-[56px]"
                    variant="default"
                    onClick={() => setIsOpen(!isOpen)}
                    title={isOpen ? "Close menu" : "Open menu"}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.15 }}
                            >
                                <X className="w-4 h-4" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0, rotate: 90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: -90 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Menu className="w-4 h-4" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>

            {/* Sub-menu buttons */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.05,
                                        ease: "easeOut",
                                    }}
                                >
                                    <Button
                                        className="rounded-full aspect-square p-5 min-w-[56px] min-h-[56px]"
                                        variant={item.variant}
                                        onClick={item.onClick}
                                        title={item.label}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActionButton;
