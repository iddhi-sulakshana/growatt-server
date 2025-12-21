import { Zap } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position } from "@xyflow/react";
import GaugeChart from "react-gauge-chart";
const LoadNode = () => {
    const { data } = getDeviceStatusService();
    const loadPower = Number(data?.data?.loadPower ?? 0);
    const loadPercent = Number(data?.data?.loadPrecent ?? 0);
    const isOnline =
        Number(data?.data?.loadPower ?? 0) !== 0 ||
        Number(data?.data?.vAcOutput ?? 0) !== 0;

    return (
        <div className="flex flex-col items-center">
            {/* Icon or Frequency Wave */}
            <div className="w-16 h-16 flex justify-center items-center">
                {isOnline ? (
                    <GaugeChart
                        id="load-gauge"
                        nrOfLevels={10}
                        percent={loadPercent / 100}
                        colors={["#22c55e", "#f59e0b", "#ef4444"]}
                        arcWidth={0.3}
                        textColor="#374151"
                        needleColor="#374151"
                        hideText={true}
                    />
                ) : (
                    <Zap className="w-13 h-13 text-gray-500" />
                )}
            </div>

            {/* Value */}
            <div className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                <p className="text-xs">Consumption</p>
                <p className={`text-xs font-mono `}>
                    {loadPower > 0 ? (
                        <AnimatedNumber
                            value={loadPower}
                            decimals={0}
                            suffix="W"
                        />
                    ) : isOnline ? (
                        <p className="text-yellow-500 italic">Standby</p>
                    ) : (
                        <p className="text-red-500 italic">Offline</p>
                    )}
                </p>
            </div>

            {/* Handles */}
            {/* Output Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className={isOnline ? "bg-yellow-500!" : "bg-gray-500!"}
            />
        </div>
    );
};

export default LoadNode;
