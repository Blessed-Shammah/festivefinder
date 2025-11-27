import React, { useEffect, useState } from 'react';

export const SnowEffect: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<number[]>([]);

  useEffect(() => {
    // Generate static number of snowflakes
    const flakes = Array.from({ length: 50 }, (_, i) => i);
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {snowflakes.map((i) => {
        const left = Math.random() * 100;
        const animationDuration = 5 + Math.random() * 10;
        const animationDelay = Math.random() * 5;
        const size = 0.5 + Math.random() * 0.5; // rem

        return (
          <div
            key={i}
            className="absolute top-[-20px] bg-white rounded-full opacity-60 animate-fall"
            style={{
              left: `${left}%`,
              width: `${size}rem`,
              height: `${size}rem`,
              animation: `fall ${animationDuration}s linear infinite`,
              animationDelay: `-${animationDelay}s`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) translateX(0px) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) translateX(20px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
