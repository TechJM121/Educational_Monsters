import React from 'react';
import { motion } from 'framer-motion';

export const FloatingParticles: React.FC = () => {
    // Reduce particles on mobile for better performance
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 25 : 50;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 100 - 50, 0],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Larger floating elements */}
            {Array.from({ length: typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8 }, (_, i) => (
                <motion.div
                    key={`large-${i}`}
                    className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -200, 0],
                        x: [0, Math.random() * 200 - 100, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: Math.random() * 30 + 20,
                        delay: Math.random() * 10,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
};