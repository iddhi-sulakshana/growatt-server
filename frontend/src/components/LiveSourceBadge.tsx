import { useEffect, useState } from "react";
import { getDeviceStatusService } from "@/service/growatt";
import { isLiveReading } from "@/lib/live-status";

/**
 * Where the live numbers come from: Live (a GroBro reading received under 30 s ago),
 * Stale (the last GroBro reading is older — the numbers are frozen), or Cloud.
 * Judged by when the reading reached this browser, whether it came over the stream or
 * from polling.
 */
const LiveSourceBadge = () => {
    const { data: deviceStatus, dataUpdatedAt } = getDeviceStatusService();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const source = deviceStatus?.data?.source;
    const state = isLiveReading(source, dataUpdatedAt, now)
        ? "live"
        : source === "grobro"
          ? "stale"
          : "cloud";

    const look = {
        live: { label: "Live", dot: "bg-emerald-500 animate-pulse", title: "Live data from the inverter (local)" },
        stale: { label: "Stale", dot: "bg-amber-500", title: "No new reading for 30 s — showing the last one" },
        cloud: { label: "Cloud", dot: "bg-slate-400", title: "Data from the Growatt cloud" },
    }[state];

    return (
        <div
            className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md bg-white/60 dark:bg-slate-900/50 border border-white/80 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-200"
            title={look.title}
        >
            <span className={`h-2 w-2 rounded-full ${look.dot}`} />
            {look.label}
        </div>
    );
};

export default LiveSourceBadge;
