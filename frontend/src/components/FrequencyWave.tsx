import { useState, useEffect, useRef } from "react";

const FrequencyWave = ({
    frequency,
    color,
}: {
    frequency: number;
    color: string;
}) => {
    const [phase, setPhase] = useState(0);
    const animationRef = useRef<number | null>(null);
    const width = 64;
    const height = 64;
    const sampleCount = 100;

    useEffect(() => {
        const animate = () => {
            setPhase((prev) => (prev + 0.005) % 1);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const points = [];
    for (let i = 0; i < sampleCount; i++) {
        const x = (i / sampleCount) * width;
        const y =
            height / 2 +
            Math.sin(
                (i / sampleCount + phase) * (frequency / 10) * 2 * Math.PI
            ) *
                (height / 3);
        points.push([x, y]);
    }
    const pathData = `M ${points.map((p) => `${p[0]},${p[1]}`).join(" L ")}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <path
                d={pathData}
                stroke={color}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default FrequencyWave;
