"use client";

import { motion } from "framer-motion";
import { Headphones, Play } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 w-full h-full bg-[#121212] flex flex-col items-center justify-center overflow-hidden z-50"
    >
      {/* Fond Étoilé Subtil */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-1 h-1 bg-white rounded-full opacity-20"
          style={{ top: "10%", left: "15%" }}
        />
        <div
          className="absolute w-1 h-1 bg-white rounded-full opacity-30"
          style={{ top: "20%", left: "80%" }}
        />
        <div
          className="absolute w-1 h-1 bg-white rounded-full opacity-20"
          style={{ top: "50%", left: "10%" }}
        />
        <div
          className="absolute w-1 h-1 bg-white rounded-full opacity-25"
          style={{ top: "70%", left: "85%" }}
        />
        <div
          className="absolute w-1 h-1 bg-white rounded-full opacity-15"
          style={{ top: "30%", left: "50%" }}
        />
      </div>

      {/* Contenu Principal - Centré */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center px-6 w-full h-full">
        {/* Titre Principal */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-[#F1FAEE] drop-shadow-lg leading-tight">
            HORIZONS
            <br />
            <span className="text-[#E67E22]">SUSPENDUS</span>
          </h1>
          <p className="text-[#457B9D] mt-4 text-lg tracking-widest uppercase font-light">
            Une exploration interactive
          </p>
        </motion.div>

        {/* Message Écouteurs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex items-center gap-3 bg-[#457B9D]/10 border border-[#457B9D]/30 rounded-lg px-6 py-3"
        >
          <Headphones size={24} className="text-[#E67E22] flex-shrink-0" />
          <span className="text-[#457B9D] text-sm md:text-base font-medium">
            Pour une meilleure expérience, utilisez des écouteurs
          </span>
        </motion.div>

        {/* Bouton Commencer */}
        <motion.button
          onClick={onStart}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-gradient-to-r from-[#E67E22] to-[#E67E22]/80 text-white font-bold text-lg uppercase tracking-wider rounded-lg flex items-center gap-3 hover:shadow-2xl transition-all duration-300"
        >
          <Play size={24} fill="currentColor" />
          Commencer l'expérience
        </motion.button>

        {/* Texte d'intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="max-w-2xl"
        >
          <p className="text-[#F1FAEE]/60 text-sm md:text-base leading-relaxed font-serif">
            Explorez une constellation de témoignages, de données et de
            réflexions sur ce que signifie
            <span className="text-[#E67E22] font-semibold"> être jeune </span>à
            l'époque de l'incertitude.
          </p>
        </motion.div>
      </div>

      {/* Décorations en bas */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-8 z-10 text-[#457B9D]/40"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </motion.div>
    </motion.div>
  );
}
