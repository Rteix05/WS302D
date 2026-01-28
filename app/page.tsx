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
    // C'EST ICI QUE LA MAGIE OPÈRE :
    // Quand on ferme le panneau, on débloque les chapitres suivants liés à celui qu'on vient de lire.
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
      {/* Landing Page */}
      <AnimatePresence>
        {!hasStarted && <LandingPage onStart={handleStartExperience} />}
      </AnimatePresence>

      {/* Main Experience - Visible seulement après le démarrage */}
      <main
        className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#121212]"
        style={{ display: hasStarted ? "block" : "none" }}
      >
        {/* 1. Fond Étoilé */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <StarBackground />
        </div>

        {/* 2. La Constellation - Toujours en plein écran */}
        <div
          className="absolute inset-0 z-50"
          style={{ pointerEvents: selectedChapter ? "none" : "auto" }}
        >
          <ConstellationGraph
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedChapter}
          />

          {/* Titre (disparaît si un chapitre est ouvert) */}
          <motion.div
            className="absolute top-10 left-10 pointer-events-none z-60"
            initial={{ opacity: 1, x: 0 }}
            animate={{
              opacity: selectedChapter ? 0 : 1,
              x: selectedChapter ? -50 : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#F1FAEE] drop-shadow-lg">
              ÊTRE <span className="text-[#E67E22]">JEUNE</span>
            </h1>
            <p className="text-[#457B9D] mt-2 text-lg tracking-widest uppercase">
              Horizons Suspendus
            </p>
          </motion.div>
        </div>

        {/* 3. Le Panneau - Popup qui glisse de la droite */}
        <AnimatePresence>
          {selectedChapter && (
            <motion.div
              key={selectedChapter}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                height: "100%",
                width: "50vw",
                maxWidth: "600px",
                zIndex: 100,
                backgroundColor: "#121212",
              }}
              className="shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <ChapterPanel chapterId={selectedChapter} onClose={handleClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
