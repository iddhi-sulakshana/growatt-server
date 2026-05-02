import TotalMetrics from "@/components/TotalMetrics";
import SystemDiagram from "@/components/SystemDiagram";
import ActionButton from "@/components/ActionButton";
import BatteryMaxChargeModal from "@/components/BatteryMaxChargeModal";
import AcOutputSourceModal from "@/components/AcOutputSourceModal";
import ChargeSourceModal from "@/components/ChargeSourceModal";

const Dashboard = () => {
    return (
        <main className="bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen h-screen w-screen flex md:items-center md:justify-center overflow-y-auto md:overflow-hidden relative">
            {/* Ambient glow orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-violet-400/10 dark:bg-violet-500/8 rounded-full blur-3xl" />
            </div>
            <ActionButton />
            <BatteryMaxChargeModal />
            <AcOutputSourceModal />
            <ChargeSourceModal />
            <div className="flex flex-col md:flex-row md:items-center md:justify-center h-full w-full gap-2 p-4 pt-16 md:pt-4 relative z-10">
                <div className="h-full w-full flex md:items-center md:justify-center flex-col gap-4">
                    <div className="aspect-square w-full rounded-2xl h-full backdrop-blur-md bg-white/50 dark:bg-slate-900/30 border border-white/80 dark:border-white/10 shadow-2xl overflow-hidden">
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
