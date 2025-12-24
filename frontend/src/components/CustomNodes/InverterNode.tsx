import { ServerCrash } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position } from "@xyflow/react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";
import LiveInverter from "../HoverCards/LiveInverter";

const InverterNode = () => {
    const { data } = getDeviceStatusService();
    const totalSolar = Number(data?.data?.panelPower ?? 0);

    return (
        <HoverCard>
            <HoverCardTrigger>
                <div className="flex flex-col items-center">
                    {/* Value */}
                    <div className="text-sm font-semibold text-center whitespace-nowrap">
                        <p className={`text-lg font-sans font-bold`}>
                            {totalSolar > 0 ? (
                                <AnimatedNumber
                                    value={totalSolar}
                                    decimals={0}
                                    suffix="W"
                                />
                            ) : (
                                <p className="text-red-500 italic">Offline</p>
                            )}
                        </p>
                    </div>
                    {/* Icon or Frequency Wave */}
                    <div className="w-16 h-16 flex justify-center items-center">
                        <ServerCrash className="w-13 h-13 text-black-500" />
                    </div>
                    <div className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                        <p className="text-xs">Inverter</p>
                    </div>
                    {/* Handles */}
                    {/* Top Input Handle */}
                    <Handle
                        type="target"
                        position={Position.Top}
                        id="top"
                        className="bg-green-500!"
                    />

                    {/* Bottom Input Handle */}
                    <Handle
                        type="target"
                        position={Position.Bottom}
                        id="bottom-target"
                        className="bg-blue-500!"
                    />

                    {/* Bottom Output Handle */}
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="bottom"
                        className="bg-blue-500!"
                    />

                    {/* Left Input Handle */}
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="left"
                        className="bg-red-500!"
                    />

                    {/* Right Output Handle */}
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="right"
                        className="bg-yellow-500!"
                    />
                </div>
            </HoverCardTrigger>
            <HoverCardContent>
                <LiveInverter />
            </HoverCardContent>
        </HoverCard>
    );
};

export default InverterNode;
