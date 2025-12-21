import { useEffect, useRef, useState } from "react";

const SolarParticles = ({ isGenerating }: { isGenerating: boolean }) => {
    const [particles, setParticles] = useState<
        Array<{ x: number; y: number; opacity: number }>
    >([]);
    const animationRef = useRef<number | null>(null);
    const particleListRef = useRef<
        Array<{
            x: number;
            y: number;
            opacity: number;
            angle: number;
            speed: number;
        }>
    >([]);

    useEffect(() => {
        if (!isGenerating) {
            setParticles([]);
            particleListRef.current = [];
            return;
        }

        const animate = () => {
            // Add new particle occasionally
            if (Math.random() > 0.85) {
                particleListRef.current.push({
                    x: 32,
                    y: 32,
                    opacity: 1,
                    angle: Math.random() * Math.PI * 2,
                    speed: 0.3 + Math.random() * 0.4,
                });
            }

            // Update particles
            particleListRef.current = particleListRef.current
                .map((p) => ({
                    ...p,
                    x: p.x + Math.cos(p.angle) * p.speed,
                    y: p.y + Math.sin(p.angle) * p.speed,
                    opacity: p.opacity - 0.015,
                }))
                .filter(
                    (p) =>
                        p.opacity > 0 &&
                        Math.abs(p.x - 32) < 30 &&
                        Math.abs(p.y - 32) < 30
                );

            setParticles(
                particleListRef.current.map((p) => ({
                    x: p.x,
                    y: p.y,
                    opacity: p.opacity,
                }))
            );
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isGenerating]);

    return (
        <svg width="64" height="64" viewBox="0 0 64 64">
            {/* Center sun */}
            <circle cx="32" cy="32" r="10" fill="#fbbf24" />
            {/* Particles */}
            {particles.map((p, i) => (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="2"
                    fill="#fde68a"
                    opacity={p.opacity}
                />
            ))}
        </svg>
    );
};

export default SolarParticles;
