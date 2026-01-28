"use client";

import { motion } from "framer-motion";
import { Headphones } from "lucide-react";

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
    className={`absolute z-20 w-32 aspect-square rounded-full flex items-center justify-center text-center backdrop-blur-md border border-white/30 text-[#F1FAEE] text-sm font-medium tracking-wide pointer-events-none select-none p-2
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
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden z-[100] font-['Space_Grotesk',_sans-serif] bg-black"
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
          initial={{ opacity: 0, y: 30, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center mb-6"
        >
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold text-white text-center drop-shadow-2xl uppercase leading-none tracking-tight">
            HORIZONS
          </h1>
          <h1
            className="text-5xl md:text-8xl lg:text-9xl font-bold text-transparent text-center drop-shadow-2xl uppercase leading-none tracking-tight"
            style={{
              WebkitTextStroke: "1.5px rgba(241, 250, 238, 0.9)",
              textShadow: "0 0 30px rgba(255,255,255,0.2)",
            }}
          >
            SUSPENDUS
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
            className="flex items-center gap-3 px-6 py-2 rounded-full mb-20" // Espace augmenté avant le bouton
            style={glassStyle}
          >
            <Headphones size={16} className="text-white/80 animate-pulse" />
            <span className="text-white/90 text-xs tracking-widest uppercase font-light">
              Casque recommandé
            </span>
          </div>

          {/* BOUTON STYLE "ECHOS" FINAL 
                   - Fond sombre (black/30) pour effet fumé
                   - Bordure fine (white/30)
                   - Texte fin et espacé
                   - Padding réduit (py-3) pour la finesse
                */}
          <motion.button
            onClick={onStart}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderColor: "rgba(255,255,255,0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "rgba(0, 0, 0, 0.3)", // Fond sombre transparent
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.3)", // Bordure fine
            }}
            className="px-10 py-3 rounded-full text-white text-sm font-light uppercase tracking-[0.2em] cursor-pointer transition-all shadow-lg"
          >
            Entrer dans la constellation
          </motion.button>

          <p className="max-w-md text-white/40 text-xs font-serif italic mt-6 text-center">
            "Qu'est-ce que signifie se construire quand l'avenir est flou ?"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
