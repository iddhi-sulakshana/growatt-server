import TotalMetrics from "@/components/TotalMetrics";
import SystemDiagram from "@/components/SystemDiagram";
import ActionButton from "@/components/ActionButton";
import BatteryMaxChargeModal from "@/components/BatteryMaxChargeModal";

const Dashboard = () => {
    return (
        <main className="bg-gray-100 min-h-screen h-screen w-screen flex md:items-center md:justify-center overflow-y-auto md:overflow-hidden relative">
            <ActionButton />
            <BatteryMaxChargeModal />
            <div className="flex flex-col md:flex-row md:items-center md:justify-center h-full w-full gap-2 p-4 pt-16 md:pt-4">
                <div className="h-full w-full flex md:items-center md:justify-center flex-col gap-4">
                    <div className="aspect-square w-full border-4 border-gray-500 rounded-lg h-full">
                        <SystemDiagram />
                    </div>
                </div>
                <div className="w-full md:h-full relative grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-2">
                    <TotalMetrics />
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
