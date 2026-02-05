import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/AuthStore";
import { Button } from "./ui/button";
import { LogOut, Menu, X, LayoutDashboard, TrendingUp, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { reloginGrowattApi } from "@/api/growatt";
import { toast } from "sonner";

const ActionButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReloginning, setIsReloginning] = useState(false);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const location = useLocation();

    const handleRelogin = async () => {
        setIsReloginning(true);
        try {
            const res = await reloginGrowattApi();
            if (res.data?.connected) {
                toast.success(res.message ?? "Re-login successful");
            } else {
                toast.warning(res.message ?? "Re-login completed but connection status is unknown");
            }
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Failed to re-login to Growatt");
        } finally {
            setIsReloginning(false);
        }
    };

    const menuItems = [
        // Relogin to Growatt
        {
            icon: RefreshCw,
            label: "Relogin Growatt",
            onClick: handleRelogin,
            variant: "outline" as const,
            disabled: isReloginning,
        },
        // Dashboard navigation button
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            onClick: () => {
                navigate("/dashboard");
                setIsOpen(false);
            },
            variant: (location.pathname === "/dashboard"
                ? "default"
                : "outline") as "default" | "outline",
            disabled: false,
        },
        // Analytics navigation button
        {
            icon: TrendingUp,
            label: "Analytics",
            onClick: () => {
                navigate("/analytics");
                setIsOpen(false);
            },
            variant: (location.pathname === "/analytics"
                ? "default"
                : "outline") as "default" | "outline",
            disabled: false,
        },
        {
            icon: LogOut,
            label: "Logout",
            onClick: () => {
                logout();
                setIsOpen(false);
            },
            variant: "destructive" as const,
            disabled: false,
        },
    ] as const;

    return (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
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
                                        disabled={"disabled" in item ? item.disabled : false}
                                    >
                                        <Icon
                                            className={`w-4 h-4 ${"disabled" in item && item.disabled ? "animate-spin" : ""}`}
                                        />
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
