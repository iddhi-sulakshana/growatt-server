import { useState, useEffect, useRef } from "react";
import { animate } from "framer-motion";

const ClockNode = () => {
    const [time, setTime] = useState(new Date());
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTime(now);
            setDate(now);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Format with leading zeros (single digits show as 06, not 6)
    const FormattedTime = ({ value }: { value: number }) => {
        const [displayValue, setDisplayValue] = useState(value);
        const prevValueRef = useRef(value);

        useEffect(() => {
            if (prevValueRef.current !== value) {
                const startValue = prevValueRef.current;
                const controls = animate(startValue, value, {
                    duration: 1,
                    ease: "easeOut",
                    onUpdate: (latest) => {
                        setDisplayValue(Math.round(latest));
                    },
                });
                prevValueRef.current = value;
                return () => controls.stop();
            } else {
                setDisplayValue(value);
            }
        }, [value]);

        return (
            <span className="inline-block text-center w-6">
                {String(Math.round(displayValue)).padStart(2, "0")}
            </span>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center font-mono font-extrabold text-blue-800 text-sm">
                <FormattedTime value={hours} />
                <span>:</span>
                <FormattedTime value={minutes} />
                <span>:</span>
                <FormattedTime value={seconds} />
            </div>
            <div className="text-blue-800 text-xs font-mono font-semibold">
                {dateString}
            </div>
            <div className="text-blue-800 text-xs font-mono font-semibold">
                {new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
                    date
                )}
            </div>
        </div>
    );
};

export default ClockNode;
