"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "@/components/ui/LandingPage";
import StarBackground from "@/components/ui/StarBackground";
import ConstellationGraph from "@/components/ui/ConstellationGraph";
import ChapterPanel from "@/components/ui/ChapterPanel";
import { useProgression } from "@/components/providers/ProgressionContext";
import { useSound } from "@/components/providers/SoundContext";

export default function Home() {
  const { markAsVisited, unlockNext } = useProgression();
  const { playAmbiance, fadeAmbianceOut, fadeAmbianceIn, stopAmbiance } =
    useSound();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Gestion de l'ambiance sonore
  useEffect(() => {
    if (hasStarted) {
      playAmbiance();
    }
    return () => stopAmbiance();
  }, [hasStarted, playAmbiance, stopAmbiance]);

  // Gérer le fade de l'ambiance selon si un chapitre est ouvert
  useEffect(() => {
    if (selectedChapter) {
      fadeAmbianceOut();
    } else if (hasStarted) {
      fadeAmbianceIn();
    }
  }, [selectedChapter, hasStarted, fadeAmbianceOut, fadeAmbianceIn]);

  const handleNodeSelect = (id: string) => {
    setSelectedChapter(id);
    markAsVisited(id);
  };

  const handleClose = () => {
    if (selectedChapter) {
      unlockNext(selectedChapter);
    }
    setSelectedChapter(null);
  };

  const handleStartExperience = () => {
    setHasStarted(true);
  };

  return (
    <>
      {/* 1. Landing Page */}
      <AnimatePresence>
        {!hasStarted && <LandingPage onStart={handleStartExperience} />}
      </AnimatePresence>

      {/* 2. Main Experience */}
      <motion.main
        className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#121212]"
        initial={{ filter: "blur(10px) brightness(0.5)" }}
        animate={{ 
          filter: hasStarted ? "blur(0px) brightness(1)" : "blur(10px) brightness(0.5)" 
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Fond Étoilé (Reste fixe plein écran) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <StarBackground />
        </div>

        {/* --- MODIFICATION ICI : Conteneur de la Constellation Dynamique --- */}
        {/* On anime la largeur : w-full par défaut, mais md:w-[35vw] si un chapitre est ouvert */}
        {/* L'utilisation de 'transition-all' permet de faire glisser le graphe en même temps que le panel s'ouvre */}
        <div
          className={`absolute top-0 bottom-0 left-0 z-10 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            selectedChapter ? "w-full md:w-[35vw]" : "w-full"
          }`}
          style={{ pointerEvents: hasStarted && !selectedChapter ? "auto" : "none" }}
        >
          <ConstellationGraph
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedChapter}
          />

          {/* Titre Interne */}
          {hasStarted && (
            <motion.div
              className="absolute top-10 left-10 pointer-events-none z-60"
              initial={{ opacity: 0, x: -50 }}
              animate={{
                opacity: selectedChapter ? 0 : 1,
                x: selectedChapter ? -50 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* (Tu avais laissé le contenu vide dans ton fichier, je le laisse vide ou tu peux remettre le H1 si besoin) */}
            </motion.div>
          )}
        </div>

        {/* OVERLAY FERMETURE */}
        {selectedChapter && (
          <div
            className="absolute inset-0 z-50 cursor-pointer"
            onClick={handleClose}
          />
        )}

        {/* Le Panneau Latéral */}
        <AnimatePresence>
          {selectedChapter && (
            <motion.div
              key={selectedChapter}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                height: "100%",
                // maxWidth retire pour laisser la largeur CSS gérer le responsive split
                zIndex: 100,
                backgroundColor: "#121212",
              }}
              // Sur desktop, le panel prend 65vw, laissant 35vw pour le graphe
              className="w-full md:w-[65vw] shadow-2xl border-l border-[#457B9D]/20"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }} // Animation fluide type ressort
            >
              <ChapterPanel chapterId={selectedChapter} onClose={handleClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </>
  );
}