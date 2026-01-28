"use client";

import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function StarBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0 -z-10" // -z-10 pour rester derrière tout le reste
      options={{
        background: {
          color: { value: "transparent" }, // Transparent pour laisser voir le canvas
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "bubble" }, // Légère réaction au survol
          },
          modes: {
            bubble: { distance: 200, duration: 2, size: 0, opacity: 0 },
          },
        },
        particles: {
          color: { value: "#ffffff" },
          move: {
            enable: true,
            direction: "none",
            random: true,
            speed: 0.2, // Vitesse très lente (contemplatif)
            outModes: { default: "out" },
          },
          number: {
            density: { enable: true, area: 800 },
            value: 80, // Densité d'étoiles
          },
          opacity: {
            value: 0.5,
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.1,
              sync: false,
            },
          },
          shape: { type: "circle" },
          size: {
            value: { min: 1, max: 2 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
