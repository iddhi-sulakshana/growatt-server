import { Sun, Battery, Zap, Home, Power, LogOut } from "lucide-react";
import SystemDiagram from "../components/SystemDiagram";
import { useAuthStore } from "../lib/AuthStore";
import { Button } from "@/components/ui/button";
interface MetricCard {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    todayKwh: number;
    totalKwh: number;
}
const Dashboard = () => {
    const logout = useAuthStore((state) => state.logout);
    const metrics: MetricCard[] = [
        {
            title: "Photovoltaic Output",
            icon: Sun,
            iconColor: "bg-teal-500",
            todayKwh: 21.2,
            totalKwh: 41.9,
        },
        {
            title: "Discharging",
            icon: Battery,
            iconColor: "bg-blue-500",
            todayKwh: 3.6,
            totalKwh: 22.9,
        },
        {
            title: "Charging",
            icon: Zap,
            iconColor: "bg-purple-500",
            todayKwh: 21.2,
            totalKwh: 61.1,
        },
        {
            title: "Imported from Grid",
            icon: Power,
            iconColor: "bg-orange-500",
            todayKwh: 0.7,
            totalKwh: 78.7,
        },
        {
            title: "Load Consumption",
            icon: Home,
            iconColor: "bg-red-500",
            todayKwh: 1.5,
            totalKwh: 12.3,
        },
        {
            title: "Grid-tied",
            icon: Zap,
            iconColor: "bg-gray-500",
            todayKwh: 0.0,
            totalKwh: 0.0,
        },
    ];
    return (
        <main className="bg-gray-100 h-screen w-screen flex items-center justify-center overflow-hidden relative">
            <Button
                className="absolute top-4 right-4 rounded-full aspect-square p-5"
                variant="destructive"
                onClick={logout}
            >
                <LogOut className="w-4 h-4" />
            </Button>
            <div className="flex items-center justify-center h-full w-full gap-4 p-4">
                <div className="w-1/3 h-full flex items-center justify-center flex-col gap-4">
                    <div className="aspect-square w-full border-4 border-gray-500 rounded-lg">
                        <SystemDiagram />
                    </div>
                    <div className="w-full h-full border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-1 gap-1 overflow-hidden">
                        <p className="text-sm font-bold">
                            PV Off Grid Inverter: PV Charging+Loads Supporting
                        </p>
                        <div className="h-full w-full flex flex-col overflow-auto">
                            <div className="p-1 flex justify-between items-center gap-10">
                                <div className="flex items-center justify-between w-full">
                                    <p className="text-sm font-bold">
                                        Battery Voltage
                                    </p>
                                    <p className="text-lg font-bold">
                                        56.8
                                        <span className="text-xs">V</span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <p className="text-sm font-bold">
                                        Battery Voltage
                                    </p>
                                    <p className="text-lg font-bold">
                                        56.8
                                        <span className="text-xs">V</span>
                                    </p>
                                </div>
                            </div>
                            <div className="p-1 flex justify-between items-center gap-10">
                                <div className="flex items-center justify-between w-full">
                                    <p className="text-sm font-bold">
                                        Battery Voltage
                                    </p>
                                    <p className="text-lg font-bold">
                                        56.8
                                        <span className="text-xs">V</span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <p className="text-sm font-bold">
                                        Battery Voltage
                                    </p>
                                    <p className="text-lg font-bold">
                                        56.8
                                        <span className="text-xs">V</span>
                                    </p>
                                </div>
                            </div>
                            <div className="p-1 flex justify-between items-center gap-10">
                                <div className="flex items-center justify-between w-full">
                                    <p className="text-sm font-bold">
                                        Battery Voltage
                                    </p>
                                    <p className="text-lg font-bold">
                                        56.8
                                        <span className="text-xs">V</span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <p className="text-sm font-bold">
                                        Battery Voltage
                                    </p>
                                    <p className="text-lg font-bold">
                                        56.8
                                        <span className="text-xs">V</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-2/3 h-full grid grid-cols-3 grid-rows-2 gap-4">
                    {metrics.map((metric) => (
                        <div className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex items-center justify-center">
                            <metric.icon className="w-1/2 h-1/2 animate-pulse text-green-600" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
