import { getDeviceStatusService } from "@/service/growatt";
import { useLiveConnectionStore } from "@/lib/LiveConnectionStore";

/** Shows whether the live numbers come from the local GroBro stream or the Growatt cloud. */
const LiveSourceBadge = () => {
    const { data: deviceStatus } = getDeviceStatusService();
    const connected = useLiveConnectionStore((state) => state.connected);
    const live = connected && deviceStatus?.data?.source === "grobro";

    return (
        <div
            className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md bg-white/60 dark:bg-slate-900/50 border border-white/80 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-200"
            title={
                live
                    ? "Live data from the inverter (local)"
                    : "Data from the Growatt cloud"
            }
        >
            <span
                className={`h-2 w-2 rounded-full ${
                    live ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
            />
            {live ? "Live" : "Cloud"}
        </div>
    );
};

export default LiveSourceBadge;
