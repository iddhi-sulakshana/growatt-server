import {
    BatteryWarning,
    Battery,
    BatteryLow,
    BatteryMedium,
    BatteryFull,
} from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";
import LiveBattery from "../HoverCards/LiveBattery";
import { useBatteryModalStore } from "@/lib/BatteryModalStore";

const BatteryNode = () => {
    const openModal = useBatteryModalStore((state) => state.openModal);
    const { data } = getDeviceStatusService();
    const batteryPower = Math.abs(Number(data?.data?.batPower ?? 0));

    const batteryVoltage = Number(data?.data?.vBat ?? 0); // in V
    const isCharging = Number(data?.data?.batPower ?? 0) < 0;
    const [chargingIconIndex, setChargingIconIndex] = useState(0);
    const chargingIcons = [Battery, BatteryLow, BatteryMedium, BatteryFull];

    const BAT_LOW = 45; // 45V
    const BAT_WARNING = 46.5; // 46.5V - Warning threshold
    const BAT_MAX = 58.4; // 58.4V

    // Get battery icon based on voltage level
    const getBatteryIcon = () => {
        if (batteryVoltage < BAT_WARNING) {
            return BatteryWarning;
        }

        // Calculate percentage based on voltage range
        const percentage =
            ((batteryVoltage - BAT_LOW) / (BAT_MAX - BAT_LOW)) * 100;

        if (percentage <= 25) {
            return BatteryLow;
        } else if (percentage <= 60) {
            return BatteryMedium;
        } else {
            return BatteryFull;
        }
    };

    // Get battery color based on voltage
    const getBatteryColor = () => {
        if (batteryVoltage < BAT_WARNING) {
            return "text-red-500";
        }

        return "text-blue-500";
    };

    useEffect(() => {
        if (!isCharging) {
            return;
        }

        const interval = setInterval(() => {
            setChargingIconIndex((prev) => (prev + 1) % chargingIcons.length);
        }, 500); // Cycle every 500ms

        return () => clearInterval(interval);
    }, [isCharging]);

    const ChargingIcon = chargingIcons[chargingIconIndex];
    const BatteryIcon = getBatteryIcon();
    const batteryColor = getBatteryColor();
    const isWarning = batteryVoltage < BAT_WARNING;

    return (
        <>
            <HoverCard>
                <HoverCardTrigger>
                    <div className="flex flex-col items-center">
                        {/* Icon */}
                        <div
                            className="flex flex-col w-16 h-16 justify-center items-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal();
                        }}
                        >
                            {isCharging ? (
                                <ChargingIcon
                                    className={`w-13 h-13 text-blue-500`}
                                />
                            ) : (
                                <BatteryIcon
                                    className={`w-13 h-13 ${batteryColor} ${
                                        isWarning ? "animate-pulse" : ""
                                    }`}
                                />
                            )}
                            <p className={`text-xs font-sans font-semibold`}>
                                <AnimatedNumber
                                    value={batteryVoltage}
                                    decimals={2}
                                    suffix="V"
                                />
                            </p>
                        </div>

                        {/* Value */}
                        <div className="text-sm font-semibold text-center whitespace-nowrap">
                            <p className={`text-lg font-sans font-bold`}>
                                <AnimatedNumber
                                    value={batteryPower}
                                    decimals={0}
                                    suffix="W"
                                />
                            </p>
                            <p className="text-red-500 text-xs italic animate-pulse">
                                {isWarning && "Critical"}
                            </p>
                        </div>

                        {/* Handles */}
                        {/* Input Handle */}
                        <Handle
                            type="target"
                            position={Position.Top}
                            id="top"
                            className={
                                batteryPower > 0 ? "bg-blue-500!" : "bg-gray-500!"
                            }
                        />
                        {/* Output Handle */}
                        <Handle
                            type="source"
                            position={Position.Top}
                            id="top-source"
                            className={
                                batteryPower > 0 ? "bg-blue-500!" : "bg-gray-500!"
                            }
                        />
                    </div>
                </HoverCardTrigger>
                <HoverCardContent>
                    <LiveBattery />
                </HoverCardContent>
            </HoverCard>
        </>
    );
};

export default BatteryNode;
