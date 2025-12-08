import type { GrowattDeviceStatusResponse } from "@/types/growatt";
import { getDeviceStatus, getInverterStatus } from "@/types/enums";
import { Fragment, useEffect, useRef, useState } from "react";
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
                duration: transitionDuration / 1000, // Convert to seconds
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
            {suffix && <span className="text-xs">{suffix}</span>}
        </>
    );
};

const DeviceStatus = ({
    deviceStatus,
}: {
    deviceStatus: GrowattDeviceStatusResponse | undefined;
}) => {
    const prevValuesRef = useRef<Partial<GrowattDeviceStatusResponse> | null>(
        null
    );
    const [changeStates, setChangeStates] = useState<
        Record<string, ChangeState>
    >({});
    const timeoutRefsRef = useRef<Record<string, number>>({});

    // This effect runs whenever TanStack Query refetches and provides new data
    useEffect(() => {
        if (!deviceStatus) return;

        // Clear all existing timeouts from previous changes
        Object.values(timeoutRefsRef.current).forEach((timeout) =>
            clearTimeout(timeout)
        );
        timeoutRefsRef.current = {};

        const newChangeStates: Record<string, ChangeState> = {};
        const prevValues = prevValuesRef.current;

        // Helper function to parse numeric value
        const parseValue = (value: string | undefined): number => {
            if (!value) return 0;
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        };

        // Compare each numeric field
        const fields: string[] = [
            "loadPower",
            "loadPrecent",
            "vBat",
            "capacity",
            "batPower",
            "iTotal",
            "panelPower",
            "iPv1",
            "iPv2",
            "ppv1",
            "ppv2",
            "vPv1",
            "vPv2",
            "vAcInput",
            "fAcInput",
            "vAcOutput",
            "fAcOutput",
            "gridPower",
            "rateVA",
        ];

        // Only compare if we have previous values (skip first render)
        if (prevValues) {
            fields.forEach((field) => {
                const fieldKey = field as keyof GrowattDeviceStatusResponse;
                const currentValue = parseValue(
                    deviceStatus[fieldKey] as string | undefined
                );
                const prevValue = parseValue(
                    (prevValues[fieldKey] as string | undefined) || undefined
                );

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
        prevValuesRef.current = { ...deviceStatus };

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
    const parseValue = (value: string | undefined): number => {
        if (!value) return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    if (!deviceStatus) {
        return (
            <div className="p-4 flex justify-between items-center text-center text-gray-500 gap-10">
                No device status data available
            </div>
        );
    }

    return (
        <Fragment>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">Load Power</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "loadPower"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.loadPower)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Load Percentage
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "loadPrecent"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.loadPrecent)}
                            decimals={1}
                            suffix="%"
                        />
                    </p>
                </div>
            </div>
            {/* Battery Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Battery Voltage
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "vBat"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.vBat)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Battery Capacity
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "capacity"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.capacity)}
                            decimals={1}
                            suffix="%"
                        />
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Battery Power
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "batPower"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.batPower)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Total Inverter Current
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "iTotal"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.iTotal)}
                            decimals={1}
                            suffix="A"
                        />
                    </p>
                </div>
            </div>
            <hr
                style={{
                    border: "1px solid #e0e0e0",
                }}
            />
            {/* PV Panel Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Total Panel Power
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "panelPower"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.panelPower)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full"></div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">PV1 Power</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "ppv1"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.ppv1)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">PV2 Power</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "ppv2"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.ppv2)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">PV1 Current</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "iPv1"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.iPv1)}
                            decimals={1}
                            suffix="A"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">PV2 Current</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "iPv2"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.iPv2)}
                            decimals={1}
                            suffix="A"
                        />
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">PV1 Voltage</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "vPv1"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.vPv1)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">PV2 Voltage</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "vPv2"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.vPv2)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
            </div>
            <hr
                style={{
                    border: "1px solid #e0e0e0",
                }}
            />
            {/* Grid Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">Grid Voltage</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "vAcInput"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.vAcInput)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Grid Frequency
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "fAcInput"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.fAcInput)}
                            decimals={2}
                            suffix="Hz"
                        />
                    </p>
                </div>
            </div>

            {/* AC Output Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        AC Output Voltage
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "vAcOutput"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.vAcOutput)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        AC Output Frequency
                    </p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "fAcOutput"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.fAcOutput)}
                            decimals={2}
                            suffix="Hz"
                        />
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">Grid Power</p>
                    <p
                        className={`md:text-lg text-md font-bold ${getValueColorClass(
                            "gridPower"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.gridPower)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Apparent Power
                    </p>
                    <p
                        className={`text-lg font-bold ${getValueColorClass(
                            "rateVA"
                        )}`}
                    >
                        <AnimatedNumber
                            value={parseValue(deviceStatus.rateVA)}
                            decimals={0}
                            suffix="VA"
                        />
                    </p>
                </div>
            </div>
            <hr
                style={{
                    border: "1px solid #e0e0e0",
                }}
            />
            <div className="p-1 flex justify-between items-center gap-1">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Inverter Status
                    </p>
                    <p className="md:text-lg text-sm font-bold">
                        {getInverterStatus(deviceStatus.invStatus)}
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-1">
                <div className="flex items-center justify-between w-full">
                    <p className="md:text-sm text-xs font-bold">
                        Device Status
                    </p>
                    <p className="md:text-lg text-sm font-bold">
                        {getDeviceStatus(deviceStatus.status)}
                    </p>
                </div>
            </div>
        </Fragment>
    );
};

export default DeviceStatus;
