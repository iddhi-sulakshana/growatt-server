import DeviceStatus from "@/components/DeviceStatus";
import TotalMetrics from "@/components/TotalMetrics";
import { getDeviceStatusService } from "@/service/growatt";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SystemDiagram from "@/components/SystemDiagram";
import ActionButton from "@/components/ActionButton";
import LiveMetrics from "@/components/LiveMetrics";

const Dashboard = () => {
    const { data: deviceStatus, isError, isLoading } = getDeviceStatusService();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeComponent, setActiveComponent] = useState<0 | 1>(1);

    useEffect(() => {
        if (
            scrollContainerRef.current &&
            !isLoading &&
            !isError &&
            deviceStatus
        ) {
            // Use requestAnimationFrame to ensure DOM is fully rendered
            requestAnimationFrame(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 0;
                }
            });
        }
    }, [isLoading, isError, deviceStatus]);

    return (
        <main className="bg-gray-100 min-h-screen h-screen w-screen flex md:items-center md:justify-center overflow-y-auto md:overflow-hidden relative">
            <ActionButton
                onViewChange={setActiveComponent}
                currentView={activeComponent}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-center h-full w-full gap-4 p-4 pt-16 md:pt-4">
                <div className="md:w-1/3 w-full md:h-full flex md:items-center md:justify-center flex-col gap-4">
                    <div className="aspect-square w-full border-4 border-gray-500 rounded-lg">
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
                    </div>
                    <div
                        ref={scrollContainerRef}
                        className="w-full md:h-full border-4 border-gray-500 rounded-lg flex flex-col p-1 gap-1 overflow-y-auto md:overflow-hidden md:items-center md:justify-center"
                        style={{ scrollBehavior: "auto" }}
                    >
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
                            <div className="w-full md:h-full flex flex-col md:items-center md:justify-center overflow-hidden">
                                <div className="w-full flex flex-col md:gap-3 overflow-y-scroll">
                                    <DeviceStatus
                                        deviceStatus={deviceStatus?.data}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="md:w-2/3 w-full h-full relative">
                    <div
                        className={`absolute h-full w-full inset-0 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 transition-opacity duration-1000 ${
                            activeComponent === 0
                                ? "opacity-100 z-10"
                                : "opacity-0 pointer-events-none z-0"
                        }`}
                    >
                        <TotalMetrics />
                    </div>
                    <div
                        className={`absolute h-full w-full inset-0 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2 transition-opacity duration-1000 ${
                            activeComponent === 1
                                ? "opacity-100 z-10"
                                : "opacity-0 pointer-events-none z-0"
                        }`}
                    >
                        <LiveMetrics />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
