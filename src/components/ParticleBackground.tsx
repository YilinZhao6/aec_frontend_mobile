import React, { useCallback, useEffect, useRef } from 'react';
import { loadSlim } from "tsparticles-slim";
import { Engine } from "tsparticles-engine";
import { Particles } from "react-tsparticles";

interface ParticleBackgroundProps {
  isStatic?: boolean;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ isStatic = false }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic && containerRef.current) {
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          context.globalCompositeOperation = 'destination-over';
        }
      }
    }
  }, [isStatic]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Particles
        className="absolute inset-0"
        init={particlesInit}
        options={{
          fpsLimit: 120,
          particles: {
            color: {
              value: "#6B7280",
            },
            links: {
              color: "#6B7280",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: !isStatic,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.2,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};

export default ParticleBackground;