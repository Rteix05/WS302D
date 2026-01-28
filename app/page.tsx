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
      {/* 1. Landing Page (Au-dessus de tout) */}
      <AnimatePresence>
        {!hasStarted && <LandingPage onStart={handleStartExperience} />}
      </AnimatePresence>

      {/* 2. Main Experience (Toujours présente, mais floue au début) */}
      <motion.main
        className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#121212]"
        // Animation du flou et de la lumière
        initial={{ filter: "blur(10px) brightness(0.5)" }}
        animate={{ 
          filter: hasStarted ? "blur(0px) brightness(1)" : "blur(10px) brightness(0.5)" 
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Fond Étoilé */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <StarBackground />
        </div>

        {/* La Constellation */}
        <div
          className="absolute inset-0 z-10"
          style={{ pointerEvents: hasStarted && !selectedChapter ? "auto" : "none" }}
        >
          <ConstellationGraph
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedChapter}
          />

          {/* Titre Interne (N'apparaît que quand on a commencé) */}
          {hasStarted && (
            <motion.div
              className="absolute top-10 left-10 pointer-events-none z-60"
              initial={{ opacity: 0, x: -50 }}
              animate={{
                opacity: selectedChapter ? 0 : 1,
                x: selectedChapter ? -50 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.5 }} // Petit délai pour laisser la transition finir
            >
            </motion.div>
          )}
        </div>

        {/* OVERLAY FERMETURE (Clic gauche pour fermer) */}
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
                maxWidth: "1000px",
                zIndex: 100,
                backgroundColor: "#121212",
              }}
              className="w-full md:w-[65vw] shadow-2xl border-l border-[#457B9D]/20"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <ChapterPanel chapterId={selectedChapter} onClose={handleClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </>
  );
}