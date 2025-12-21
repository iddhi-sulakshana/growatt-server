import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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

    // Track previous value and change state for color animations
    const prevValueForChangeRef = useRef<number | null>(null);
    const [changeState, setChangeState] = useState<ChangeState>(null);
    const timeoutRef = useRef<number | null>(null);

    // Effect to detect value changes and set animation state
    useEffect(() => {
        if (
            prevValueForChangeRef.current !== null &&
            prevValueForChangeRef.current !== value
        ) {
            // Clear existing timeout
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }

            // Set change state based on value comparison
            if (value > prevValueForChangeRef.current) {
                setChangeState("increased");
            } else if (value < prevValueForChangeRef.current) {
                setChangeState("decreased");
            }

            // Set timeout to reset change state after animation
            timeoutRef.current = window.setTimeout(() => {
                setChangeState(null);
            }, transitionDuration);
        }

        prevValueForChangeRef.current = value;

        // Cleanup function
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value]);

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

    // Get color class based on change state
    const getValueColorClass = (): string => {
        if (changeState === "increased") {
            return `text-green-500 transition-colors duration-[${transitionDuration}ms]`;
        } else if (changeState === "decreased") {
            return `text-red-500 transition-colors duration-[${transitionDuration}ms]`;
        }
        return `transition-colors duration-[${transitionDuration}ms]`;
    };

    return (
        <span className={getValueColorClass()}>
            {displayValue.toFixed(decimals)}
            {suffix && <span className="text-xs">{suffix}</span>}
        </span>
    );
};
export default AnimatedNumber;
