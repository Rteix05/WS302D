"use client";

import { motion } from "framer-motion";
import { Headphones, Play } from "lucide-react";

const FloatingNode = ({ text, top, left, delay }: { text: string, top: string, left: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -15, 0], 
        x: [0, 10, 0]   
    }}
    transition={{ 
        opacity: { delay, duration: 1 },
        scale: { delay, duration: 1 },
        y: { repeat: Infinity, duration: 5 + Math.random() * 2, ease: "easeInOut", delay: Math.random() },
        x: { repeat: Infinity, duration: 7 + Math.random() * 2, ease: "easeInOut", delay: Math.random() }
    }}
    style={{ top, left }}
    className="absolute z-20 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-[#F1FAEE]/90 text-sm font-light tracking-wider pointer-events-none select-none shadow-lg"
  >
    {text}
  </motion.div> 
);

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
      transition={{ duration: 1.2 }}
      // SÉCURITÉ : On applique l'image directement en CSS ici
      style={{
        backgroundImage: "url('/landing-eye-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden z-[100] font-['Space_Grotesk',_sans-serif] bg-black" 
    >
        {/* Couche sombre pour lisibilité (Overlay) */}
        <div className="absolute inset-0 bg-black/40 z-0" />
        
        {/* Dégradé bas pour le texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-0" />

        {/* Éléments flottants */}
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
            <FloatingNode text="Incertitude" top="20%" left="15%" delay={0.5} />
            <FloatingNode text="Identité" top="25%" left="75%" delay={0.7} />
            <FloatingNode text="Futur flou" top="65%" left="10%" delay={0.9} />
            <FloatingNode text="Éco-anxiété" top="60%" left="80%" delay={1.1} />
        </div>
      
        {/* Contenu Central */}
        <div className="relative z-30 flex flex-col items-center justify-center h-full w-full pb-20">
            <motion.div
                initial={{ opacity: 0, y: 30, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="flex flex-col items-center justify-center mb-12"
            >
                <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold text-white text-center drop-shadow-2xl uppercase leading-none tracking-tight">
                    HORIZONS
                </h1>
                <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 text-center drop-shadow-2xl uppercase leading-none tracking-tight">
                    SUSPENDUS
                </h1>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col items-center gap-6 mt-8"
            >
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                    <Headphones size={18} className="text-[#E67E22] animate-pulse" />
                    <span className="text-white/90 text-xs md:text-sm tracking-wider uppercase font-medium">
                        Casque recommandé
                    </span>
                </div>

                <motion.button
                    onClick={onStart}
                    whileHover={{ scale: 1.05, backgroundColor: "#F4A261" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#E67E22] text-[#121212] font-bold text-lg uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(230,126,34,0.3)] transition-all z-50 cursor-pointer"
                >
                    <span className="flex items-center gap-3">
                        <Play size={20} fill="currentColor" />
                        Entrer dans la constellation
                    </span>
                </motion.button>

                <p className="max-w-md text-white/70 text-sm md:text-base font-serif italic mt-4 text-center">
                    "Qu'est-ce que signifie se construire quand l'avenir est flou ?"
                </p>
            </motion.div>
        </div>
    </motion.div>
  );
}