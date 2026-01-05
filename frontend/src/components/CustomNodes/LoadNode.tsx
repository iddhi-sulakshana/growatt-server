import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position } from "@xyflow/react";
import { UtilityPole } from "lucide-react";
import ReactSpeedometer from "react-d3-speedometer";
import LiveLoad from "../HoverCards/LiveLoad";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";
import AnimatedNumber from "./AnimatedNumber";
const LoadNode = () => {
    const { data } = getDeviceStatusService();
    const loadPower = Number(data?.data?.loadPower ?? 0);
    const loadPercent = Number(data?.data?.loadPrecent ?? 0);
    const isOnline =
        Number(data?.data?.loadPower ?? 0) !== 0 ||
        Number(data?.data?.vAcOutput ?? 0) !== 0;
    return (
        <HoverCard>
            <HoverCardTrigger>
                <div className="flex flex-col items-center">
                    {/* Icon or Frequency Wave */}
                    <div className="w-16 h-16 flex justify-center items-baseline">
                        {isOnline ? (
                            <ReactSpeedometer
                                width={100}
                                height={100}
                                minValue={0}
                                maxValue={100}
                                value={loadPercent}
                                segments={10}
                                needleHeightRatio={0.5}
                                ringWidth={10}
                                startColor="#33CC33"
                                endColor="#FF471A"
                                labelFontSize="0px"
                                valueTextFontSize="0px"
                            />
                        ) : (
                            <UtilityPole className="w-13 h-13 text-gray-500" />
                        )}
                    </div>

                    {/* Value */}
                    <div className="text-sm font-semibold text-center whitespace-nowrap">
                        <p className="text-xs">Consumption</p>
                        <p className={`text-lg font-sans font-bold`}>
                            {loadPower > 0 ? (
                                <AnimatedNumber
                                    value={loadPower}
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
                        type="target"
                        position={Position.Left}
                        id="left"
                        className={isOnline ? "bg-yellow-500!" : "bg-gray-500!"}
                    />
                </div>
            </HoverCardTrigger>
            <HoverCardContent>
                <LiveLoad />
            </HoverCardContent>
        </HoverCard>
    );
};

export default LoadNode;
