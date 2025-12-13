import { getDeviceStatusService } from "@/service/growatt";
import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { Battery, Home, ServerCrash, SolarPanel, Zap } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

const iconMap = {
    grid: Zap,
    inverter: ServerCrash,
    consumption: Home,
    battery: Battery,
    solar: SolarPanel,
};

type ChangeState = "increased" | "decreased" | null;
const transitionDuration = 1000;

// Component to animate number changes with fixed duration
const AnimatedNumber = ({
    value,
    decimals = 0,
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

function CustomNode({
    data,
}: {
    data: { icon: keyof typeof iconMap; name: string; id: string };
}) {
    const topConnections = useHandleConnections({ type: "target", id: "top" });
    const bottomConnections = useHandleConnections({
        type: "source",
        id: "bottom",
    });
    const leftConnections = useHandleConnections({
        type: "target",
        id: "left",
    });
    const rightConnections = useHandleConnections({
        type: "source",
        id: "right",
    });

    // Build the values for the components based on the data
    const IconComponent = iconMap[data.icon];
    let handleClassName;
    switch (data.icon) {
        case "solar":
            handleClassName = "green-500";
            break;
        case "inverter":
            handleClassName = "black-500";
            break;
        case "consumption":
            handleClassName = "yellow-500";
            break;
        case "battery":
            handleClassName = "blue-500";
            break;
        case "grid":
            handleClassName = "red-500";
            break;
        default:
            handleClassName = "transparent";
            break;
    }
    const { data: deviceStatus } = getDeviceStatusService();

    let value;
    switch (data.id) {
        case "solar1":
            value = Number(deviceStatus?.data?.ppv1) ?? 0;
            break;
        case "solar2":
            value = Number(deviceStatus?.data?.ppv2) ?? 0;
            break;
        case "inverter":
            value = Number(deviceStatus?.data?.panelPower) ?? 0;
            break;
        case "grid":
            value = Number(deviceStatus?.data?.gridPower) ?? 0;
            break;
        case "consumption":
            value = Number(deviceStatus?.data?.loadPower) ?? 0;
            break;
        case "battery":
            value = Number(deviceStatus?.data?.batPower) ?? 0;
            break;
        default:
            value = 0;
    }

    // Track previous value and change state for animations
    const prevValueRef = useRef<number | null>(null);
    const [changeState, setChangeState] = useState<ChangeState>(null);
    const timeoutRef = useRef<number | null>(null);

    // Effect to detect value changes and set animation state
    useEffect(() => {
        if (prevValueRef.current !== null && prevValueRef.current !== value) {
            // Clear existing timeout
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }

            // Set change state based on value comparison
            if (value > prevValueRef.current) {
                setChangeState("increased");
            } else if (value < prevValueRef.current) {
                setChangeState("decreased");
            }

            // Set timeout to reset change state after animation
            timeoutRef.current = window.setTimeout(() => {
                setChangeState(null);
            }, transitionDuration);
        }

        prevValueRef.current = value;

        // Cleanup function
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value]);

    // Get color class based on change state
    const getValueColorClass = (): string => {
        if (changeState === "increased") {
            return `text-green-500 transition-colors duration-[${transitionDuration}ms]`;
        } else if (changeState === "decreased") {
            return `text-red-500 transition-colors duration-[${transitionDuration}ms]`;
        }
        return `transition-colors duration-[${transitionDuration}ms]`;
    };
    if (value === 0 && data.id !== "inverter") {
        handleClassName = "gray-500";
    }

    let valueString;
    switch (data.id) {
        default:
            valueString = "W";
            break;
    }

    return (
        <div className="flex flex-col items-center">
            {(data.icon === "solar" || data.id === "inverter") && (
                <div className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {data.id !== "inverter" && (
                        <p className="text-xs">{data.name}</p>
                    )}
                    <p className={`text-xs font-mono ${getValueColorClass()}`}>
                        <AnimatedNumber
                            value={value}
                            decimals={0}
                            suffix={valueString}
                        />
                    </p>
                </div>
            )}
            {/* Icon container */}
            <div className="w-16 h-16 flex justify-center items-center">
                <IconComponent
                    className={`w-13 h-13 text-${handleClassName}`}
                />
            </div>

            {data.icon !== "solar" && (
                <div className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    <p className="text-xs">{data.name}</p>
                    {data.id !== "inverter" && (
                        <p
                            className={`text-xs font-mono ${getValueColorClass()}`}
                        >
                            <AnimatedNumber
                                value={value}
                                decimals={0}
                                suffix={valueString}
                            />
                        </p>
                    )}
                </div>
            )}

            {/* Top handle */}
            {topConnections.length > 0 && (
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top"
                    className={`bg-${handleClassName}!`}
                />
            )}
            {/* Top source handle for battery (to connect to inverter) */}
            {data.id === "battery" && (
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top-source"
                    className={`bg-${handleClassName}!`}
                />
            )}

            {/* Bottom handle */}
            {bottomConnections.length > 0 && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom"
                    className={`bg-${handleClassName}!`}
                />
            )}
            {/* Bottom target handle for inverter (to receive from battery) */}
            {data.id === "inverter" && (
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="bottom-target"
                    className={`bg-${handleClassName}!`}
                />
            )}

            {/* Left handle */}
            {leftConnections.length > 0 && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left"
                    className={`bg-${handleClassName}!`}
                />
            )}

            {/* Right handle */}
            {rightConnections.length > 0 && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right"
                    className={`bg-${handleClassName}!`}
                />
            )}
        </div>
    );
}

export default memo(CustomNode);
