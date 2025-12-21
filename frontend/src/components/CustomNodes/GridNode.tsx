import { Zap } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position } from "@xyflow/react";
import FrequencyWave from "../FrequencyWave";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";
import LiveGrid from "../HoverCards/LiveGrid";

const GridNode = () => {
    const { data } = getDeviceStatusService();
    const gridPower = Number(data?.data?.gridPower ?? 0);
    const isOnline =
        Number(data?.data?.gridPower ?? 0) !== 0 ||
        Number(data?.data?.vAcInput ?? 0) !== 0;

    const frequency = Number(data?.data?.fAcInput ?? 0); // typically from 40 - 65
    return (
        <HoverCard>
            <HoverCardTrigger>
                <div className="flex flex-col items-center">
                    {/* Icon or Frequency Wave */}
                    <div className="w-16 h-16 flex justify-center items-center">
                        {isOnline && frequency > 0 ? (
                            <FrequencyWave
                                frequency={frequency}
                                color="#ef4444"
                            />
                        ) : (
                            <Zap className="w-13 h-13 text-gray-500" />
                        )}
                    </div>

                    {/* Value */}
                    <div className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                        <p className="text-xs">Grid</p>
                        <p className={`text-xs font-mono `}>
                            {gridPower > 0 ? (
                                <AnimatedNumber
                                    value={gridPower}
                                    decimals={0}
                                    suffix="W"
                                />
                            ) : isOnline ? (
                                <p className="text-yellow-500 italic">
                                    Standby
                                </p>
                            ) : (
                                <p className="text-red-500 italic">Offline</p>
                            )}
                        </p>
                    </div>

                    {/* Handles */}
                    {/* Output Handle */}
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="right"
                        className={isOnline ? "bg-red-500!" : "bg-gray-500!"}
                    />
                </div>
            </HoverCardTrigger>
            <HoverCardContent>
                <LiveGrid />
            </HoverCardContent>
        </HoverCard>
    );
};

export default GridNode;
