"use client";

import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import { useSound } from "@/components/providers/SoundContext";

// --- STYLE CSS "VERRE" ---
const glassStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
};

// --- COMPOSANT BULLE (CERCLE FORCÉ) ---
const FloatingNode = ({
  text,
  top,
  left,
  delay,
  color = "white",
}: {
  text: string;
  top: string;
  left: string;
  delay: number;
  color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: 1,
      scale: 1,
      y: [0, -15, 0],
      x: [0, 10, 0],
    }}
    transition={{
      opacity: { delay, duration: 1 },
      scale: { delay, duration: 1 },
      y: {
        repeat: Infinity,
        duration: 6 + Math.random() * 2,
        ease: "easeInOut",
        delay: Math.random(),
      },
      x: {
        repeat: Infinity,
        duration: 8 + Math.random() * 2,
        ease: "easeInOut",
        delay: Math.random(),
      },
    }}
    style={{ top, left }}
    className={`absolute z-20 w-24 md:w-32 lg:w-40 aspect-square rounded-full flex items-center justify-center text-center backdrop-blur-md border border-white/30 text-[#F1FAEE] text-[10px] md:text-xs lg:text-sm font-medium tracking-wide pointer-events-none select-none p-2 md:p-4 lg:p-6
    ${
      color === "red"
        ? "shadow-[0_0_20px_rgba(239,68,68,0.4),inset_0_0_10px_rgba(239,68,68,0.2)]"
        : color === "cyan"
          ? "shadow-[0_0_20px_rgba(34,211,238,0.4),inset_0_0_10px_rgba(34,211,238,0.2)]"
          : "shadow-[0_0_20px_rgba(255,255,255,0.2),inset_0_0_10px_rgba(255,255,255,0.1)]"
    }`}
  >
    <span className="drop-shadow-md">{text}</span>
  </motion.div>
);

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const { playClick2, playHover } = useSound();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
      transition={{ duration: 1.2 }}
      style={{
        backgroundImage: "url('/landing-eye-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden z-[100] bg-black"
    >
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-0" />

      {/* Éléments flottants */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        <FloatingNode
          text="Incertitude"
          top="20%"
          left="15%"
          delay={0.5}
          color="red"
        />
        <FloatingNode
          text="Identité"
          top="25%"
          left="75%"
          delay={0.7}
          color="white"
        />
        <FloatingNode
          text="Futur flou"
          top="65%"
          left="10%"
          delay={0.9}
          color="white"
        />
        <FloatingNode
          text="Éco-anxiété"
          top="60%"
          left="80%"
          delay={1.1}
          color="cyan"
        />
      </div>

      <div className="relative z-30 flex flex-col items-center justify-center h-full w-full pb-10">
        {/* TITRE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-sans font-black text-white text-center drop-shadow-2xl uppercase leading-none tracking-tight">
            HORIZONS{" "}
            <span
              className="text-transparent ml-2"
              style={{
                WebkitTextStroke: "2px #E67E22",
              }}
            >
              SUSPENDUS
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col items-center justify-end w-full"
        >
          {/* MESSAGE CASQUE */}
          <div
            className="flex items-center gap-3 px-6 py-2 rounded-full mb-10 md:mb-20" // Espace augmenté avant le bouton
            style={glassStyle}
          >
            <Headphones size={16} className="text-white/80 animate-pulse" />
            <span className="text-white/90 text-xs tracking-widest uppercase font-light">
              Casque recommandé
            </span>
          </div>

          {/* BOUTON STYLE "ECHOS" FINAL */}
          <motion.button
            onClick={onStart}
            onHoverStart={playHover}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(230, 126, 34, 0.2)", // Orange subtil au survol
              borderColor: "#E67E22",
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "rgba(255, 255, 255, 0.1)", // Fond clair très transparent (Glass)
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.5)", // Bordure semi-opaque
            }}
            className="px-8 py-4 md:px-14 md:py-6 rounded-full text-white text-base md:text-xl font-sans font-bold uppercase tracking-[0.25em] cursor-pointer transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            Entrer dans la constellation
          </motion.button>
          
          <p className="max-w-xl text-white/80 text-sm md:text-base font-serif italic mt-5 md:mt-10 text-center drop-shadow-md px-4">
            "Qu'est-ce que signifie se construire quand l'avenir est flou ?"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
