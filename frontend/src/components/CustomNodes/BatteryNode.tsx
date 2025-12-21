import { Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";

const BatteryNode = () => {
    const { data } = getDeviceStatusService();
    const batteryPower = Math.abs(Number(data?.data?.batPower ?? 0));
    const isCharging = Number(data?.data?.batPower ?? 0) < 0;
    const [chargingIconIndex, setChargingIconIndex] = useState(0);
    const chargingIcons = [Battery, BatteryLow, BatteryMedium, BatteryFull];
    useEffect(() => {
        if (!isCharging) {
            setChargingIconIndex(2);
            return;
        }

        const interval = setInterval(() => {
            setChargingIconIndex((prev) => (prev + 1) % chargingIcons.length);
        }, 500); // Cycle every 500ms

        return () => clearInterval(interval);
    }, [isCharging]);

    const ChargingIcon = chargingIcons[chargingIconIndex];

    return (
        <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="w-16 h-16 flex justify-center items-center">
                {isCharging ? (
                    <ChargingIcon className={`w-13 h-13 text-blue-500`} />
                ) : (
                    <Battery
                        className={`w-13 h-13 text-${
                            batteryPower > 0 ? "blue" : "gray"
                        }-500`}
                    />
                )}
            </div>

            {/* Value */}
            <div className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                <p className="text-xs">Battery</p>
                <p className={`text-xs font-mono `}>
                    <AnimatedNumber
                        value={batteryPower}
                        decimals={0}
                        suffix="W"
                    />
                </p>
            </div>

            {/* Handles */}
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                className={batteryPower > 0 ? "bg-blue-500!" : "bg-gray-500!"}
            />
            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Top}
                id="top-source"
                className={batteryPower > 0 ? "bg-blue-500!" : "bg-gray-500!"}
            />
        </div>
    );
};

export default BatteryNode;
