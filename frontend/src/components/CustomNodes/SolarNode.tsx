import { SolarPanel } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position } from "@xyflow/react";
import GaugeChart from "react-gauge-chart";

const SolarNode = ({ id }: { id: 1 | 2 }) => {
    const { data } = getDeviceStatusService();
    const solarPower = Number(data?.data?.[`ppv${id}`] ?? 0);
    const isOnline =
        Number(data?.data?.[`ppv${id}`] ?? 0) !== 0 ||
        Number(data?.data?.[`vPv${id}`] ?? 0) !== 0;

    const maximumSolarPower = 3500;
    const solarPercent = solarPower / maximumSolarPower;

    return (
        <div className="flex flex-col items-center">
            {/* Icon or Frequency Wave */}
            <div className="w-16 h-16 flex justify-center items-center">
                {isOnline ? (
                    <div className="flex flex-col items-center w-full">
                        <GaugeChart
                            id="solar-gauge"
                            nrOfLevels={10}
                            percent={solarPercent}
                            colors={["#ef4444", "#f59e0b", "#22c55e"]}
                            arcWidth={0.3}
                            textColor="#374151"
                            needleColor="#374151"
                            hideText={true}
                        />
                        <p className="text-xs">
                            {Math.round(solarPercent * 100)}%
                        </p>
                    </div>
                ) : (
                    <SolarPanel className="w-13 h-13 text-gray-500" />
                )}
            </div>

            {/* Value */}
            <div className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                <p className="text-xs">Solar {id}</p>
                <p className={`text-xs font-mono `}>
                    {solarPower > 0 ? (
                        <AnimatedNumber
                            value={solarPower}
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
                type="source"
                position={Position.Bottom}
                id="bottom"
                className={isOnline ? "bg-green-500!" : "bg-gray-500!"}
            />
        </div>
    );
};

export default SolarNode;
