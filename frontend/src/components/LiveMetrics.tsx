import { getDeviceStatusService } from "@/service/growatt";
import {
    AlertCircle,
    Battery,
    BatteryCharging,
    Home,
    Loader2,
    ServerCrash,
    SolarPanel,
    Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

type ChangeState = "increased" | "decreased" | null;
const transitionDuration = 1000;

// Component to animate number changes with fixed duration
const AnimatedNumber = ({
    value,
    decimals = 1,
    suffix = "",
}: {
    value: number;
    decimals?: number;
    suffix?: string;
}) => {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (prevValueRef.current !== value) {
            const startValue = prevValueRef.current;
            const controls = animate(startValue, value, {
                duration: 1, // 1 second
                ease: "easeOut",
                onUpdate: (latest) => {
                    setDisplayValue(latest);
                },
            });

            prevValueRef.current = value;
            return () => controls.stop();
        }
    }, [value]);

    return (
        <>
            {displayValue.toFixed(decimals)}
            {suffix && <span className="md:text-2xl text-xs">{suffix}</span>}
        </>
    );
};

const Metrics = () => {
    const {
        data: deviceStatus,
        isError: isDeviceStatusError,
        isLoading: isDeviceStatusLoading,
    } = getDeviceStatusService();

    const prevValuesRef = useRef<any | null>(null);
    const [changeStates, setChangeStates] = useState<
        Record<string, ChangeState>
    >({});
    const timeoutRefsRef = useRef<Record<string, number>>({});

    // This effect runs whenever TanStack Query refetches and provides new data
    useEffect(() => {
        if (!deviceStatus?.data) return;

        // Clear all existing timeouts from previous changes
        Object.values(timeoutRefsRef.current).forEach((timeout) =>
            clearTimeout(timeout)
        );
        timeoutRefsRef.current = {};

        const newChangeStates: Record<string, ChangeState> = {};
        const prevValues = prevValuesRef.current;

        // Compare each numeric field
        const fields: string[] = [
            "ppv1",
            "ppv2",
            "vPv1",
            "vPv2",
            "iPv1",
            "iPv2",
            "batPower",
            "vBat",
            "capacity",
            "gridPower",
            "vAcInput",
            "fAcInput",
            "loadPower",
            "vAcOutput",
            "fAcOutput",
            "loadPrecent",
            "iTotal",
            "rateVA",
        ];

        // Only compare if we have previous values (skip first render)
        if (prevValues) {
            fields.forEach((field) => {
                const fieldKey = field as keyof typeof deviceStatus.data;
                const currentValue = parseValue(deviceStatus?.data?.[fieldKey]);
                const prevValue = parseValue(prevValues[field]);

                // Compare values and set change state
                if (currentValue > prevValue) {
                    newChangeStates[field] = "increased";
                    // Set timeout to fade back to original color after 1 second
                    timeoutRefsRef.current[field] = window.setTimeout(() => {
                        setChangeStates((prev) => ({
                            ...prev,
                            [field]: null,
                        }));
                    }, transitionDuration);
                } else if (currentValue < prevValue) {
                    newChangeStates[field] = "decreased";
                    // Set timeout to fade back to original color after 1 second
                    timeoutRefsRef.current[field] = window.setTimeout(() => {
                        setChangeStates((prev) => ({
                            ...prev,
                            [field]: null,
                        }));
                    }, transitionDuration);
                }
            });

            // Update change states
            setChangeStates((prev) => ({ ...prev, ...newChangeStates }));
        }

        // Update previous values for next comparison
        prevValuesRef.current = { ...deviceStatus.data };

        // Cleanup function to clear timeouts on unmount
        return () => {
            Object.values(timeoutRefsRef.current).forEach((timeout) =>
                clearTimeout(timeout)
            );
        };
    }, [deviceStatus]);

    const getValueColorClass = (field: string): string => {
        const changeState = changeStates[field];
        if (changeState === "increased") {
            return `text-green-500 transition-colors duration-[${transitionDuration}ms]`;
        } else if (changeState === "decreased") {
            return `text-red-500 transition-colors duration-[${transitionDuration}ms]`;
        }
        return `transition-colors duration-[${transitionDuration}ms]`;
    };

    // Helper to parse numeric value
    const parseValue = (value: string | number | undefined): number => {
        if (value === undefined || value === null) return 0;
        const parsed = typeof value === "string" ? parseFloat(value) : value;
        return isNaN(parsed) ? 0 : parsed;
    };

    if (isDeviceStatusLoading) {
        return (
            <div className="col-span-full flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (isDeviceStatusError) {
        return (
            <div className="col-span-full flex items-center justify-center p-8">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-6 h-6" />
                    <span>Failed to load device status data</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Solar 1 */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-2">
                <div className="flex flex-col items-center justify-center h-2/5 gap-2">
                    <SolarPanel
                        className={`w-full h-full ${
                            Number(deviceStatus?.data?.ppv1 || 0) === 0
                                ? "text-gray-500"
                                : "text-green-500"
                        }`}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono">
                        Solar 1 (
                        {Number(deviceStatus?.data?.ppv1 || 0) === 0
                            ? "Offline"
                            : "Online"}
                        )
                    </p>
                </div>
                <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Panel Power</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "ppv1"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.ppv1)}
                                decimals={0}
                                suffix="W"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Panel Voltage</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "vPv1"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.vPv1)}
                                decimals={1}
                                suffix="V"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Panel Current</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "iPv1"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.iPv1)}
                                decimals={1}
                                suffix="A"
                            />
                        </p>
                    </div>
                </div>
            </div>
            {/* Solar 2 */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-2">
                <div className="flex flex-col items-center justify-center h-2/5 gap-2">
                    <SolarPanel
                        className={`w-full h-full ${
                            Number(deviceStatus?.data?.ppv2 || 0) === 0
                                ? "text-gray-500"
                                : "text-green-500"
                        }`}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono">
                        Solar 2 (
                        {Number(deviceStatus?.data?.ppv2 || 0) === 0
                            ? "Offline"
                            : "Online"}
                        )
                    </p>
                </div>
                <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Panel Power</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "ppv2"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.ppv2)}
                                decimals={0}
                                suffix="W"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Panel Voltage</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "vPv2"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.vPv2)}
                                decimals={1}
                                suffix="V"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Panel Current</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "iPv2"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.iPv2)}
                                decimals={1}
                                suffix="A"
                            />
                        </p>
                    </div>
                </div>
            </div>
            {/* Battery */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-2">
                <div className="flex flex-col items-center justify-center h-2/5 gap-2">
                    {Number(deviceStatus?.data?.batPower || 0) < 0 ? (
                        <BatteryCharging
                            className={`w-full h-full ${
                                Number(deviceStatus?.data?.batPower || 0) === 0
                                    ? "text-gray-500"
                                    : "text-blue-500"
                            }`}
                        />
                    ) : (
                        <Battery
                            className={`w-full h-full ${
                                Number(deviceStatus?.data?.batPower || 0) === 0
                                    ? "text-gray-500"
                                    : "text-blue-500"
                            }`}
                        />
                    )}
                    <p className="md:text-md text-xs font-extrabold font-mono">
                        Battery (
                        {Number(deviceStatus?.data?.batPower || 0) < 0
                            ? "Charging"
                            : "Discharging"}
                        )
                    </p>
                </div>
                <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Battery Power</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "batPower"
                            )}`}
                        >
                            <AnimatedNumber
                                value={Math.abs(
                                    parseValue(deviceStatus?.data?.batPower)
                                )}
                                decimals={0}
                                suffix="W"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Battery Voltage</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "vBat"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.vBat)}
                                decimals={1}
                                suffix="V"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Battery Capacity</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "capacity"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.capacity)}
                                decimals={1}
                                suffix="%"
                            />
                        </p>
                    </div>
                </div>
            </div>
            {/* Grid */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-2">
                <div className="flex flex-col items-center justify-center h-2/5 gap-2">
                    <Zap
                        className={`w-full h-full ${
                            Number(deviceStatus?.data?.gridPower || 0) !== 0 || Number(deviceStatus?.data?.vAcInput || 0) !== 0
                                ? "text-red-500"
                                : "text-gray-500"
                        }`}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono">
                        Grid (
                        {Number(deviceStatus?.data?.gridPower || 0) !== 0
                            ? "Online"
                            : Number(deviceStatus?.data?.vAcInput || 0) !== 0
                                ? "Standby"
                            : "Offline"}
                        )
                    </p>
                </div>
                <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Grid Power</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "gridPower"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(
                                    deviceStatus?.data?.gridPower
                                )}
                                decimals={0}
                                suffix="W"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Grid Voltage</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "vAcInput"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.vAcInput)}
                                decimals={1}
                                suffix="V"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Grid Frequency</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "fAcInput"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.fAcInput)}
                                decimals={2}
                                suffix="Hz"
                            />
                        </p>
                    </div>
                </div>
            </div>
            {/* Load */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-2">
                <div className="flex flex-col items-center justify-center h-2/5 gap-2">
                    <Home
                        className={`w-full h-full ${
                            Number(deviceStatus?.data?.loadPower || 0) === 0
                                ? "text-gray-500"
                                : "text-yellow-500"
                        }`}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono">
                        Load (
                        {Number(deviceStatus?.data?.loadPower || 0) === 0
                            ? "Offline"
                            : "Online"}
                        )
                    </p>
                </div>
                <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Load Power</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "loadPower"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(
                                    deviceStatus?.data?.loadPower
                                )}
                                decimals={0}
                                suffix="W"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Load Voltage</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "vAcOutput"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(
                                    deviceStatus?.data?.vAcOutput
                                )}
                                decimals={1}
                                suffix="V"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Load Frequency</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "fAcOutput"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(
                                    deviceStatus?.data?.fAcOutput
                                )}
                                decimals={2}
                                suffix="Hz"
                            />
                        </p>
                    </div>
                </div>
            </div>
            {/* Inverter */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center p-2">
                <div className="flex flex-col items-center justify-center h-2/5 gap-2">
                    <ServerCrash
                        className={`w-full h-full ${
                            Number(deviceStatus?.data?.loadPrecent || 0) === 0
                                ? "text-gray-500"
                                : "text-black"
                        }`}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono">
                        Inverter
                    </p>
                </div>
                <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Inverter Load</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "loadPrecent"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(
                                    deviceStatus?.data?.loadPrecent
                                )}
                                decimals={1}
                                suffix="%"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Inverter Current</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "iTotal"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.iTotal)}
                                decimals={1}
                                suffix="A"
                            />
                        </p>
                    </div>
                    <div className="w-full h-full flex items-center justify-between">
                        <p className="md:text-lg text-xs">Apparent Power</p>
                        <p
                            className={`md:text-3xl text-md font-mono font-bold ${getValueColorClass(
                                "rateVA"
                            )}`}
                        >
                            <AnimatedNumber
                                value={parseValue(deviceStatus?.data?.rateVA)}
                                decimals={0}
                                suffix="VA"
                            />
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Metrics;
