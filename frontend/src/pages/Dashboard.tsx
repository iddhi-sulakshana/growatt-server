import {
    Sun,
    Battery,
    Zap,
    Home,
    Power,
    LogOut,
    Loader2,
    AlertCircle,
} from "lucide-react";
import SystemDiagram from "../components/SystemDiagram";
import { useAuthStore } from "../lib/AuthStore";
import { Button } from "@/components/ui/button";
import { getDeviceStatusService } from "@/service/growatt";
import DeviceStatus from "@/components/DeviceStatus";
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
    const { data: deviceStatus, isError, isLoading } = getDeviceStatusService();
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
                    {/* <div className="aspect-square w-full border-4 border-gray-500 rounded-lg">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full w-full">
                                <Loader2 className="w-10 h-10 animate-spin" />
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                                <p className="text-sm font-bold">
                                    Failed to get device status
                                </p>
                            </div>
                        ) : (
                            <SystemDiagram />
                        )}
                    </div> */}
                    <div className="w-full h-full border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-1 gap-1 overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full w-full">
                                <Loader2 className="w-10 h-10 animate-spin" />
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                                <p className="text-sm font-bold">
                                    Failed to get device status
                                </p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="h-full w-full flex flex-col overflow-auto">
                                    <DeviceStatus
                                        deviceStatus={deviceStatus?.data}
                                    />
                                </div>
                            </div>
                        )}
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
