"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarBackground from "@/components/ui/StarBackground";
import ConstellationGraph from "@/components/ui/ConstellationGraph";
import ChapterPanel from "@/components/ui/ChapterPanel";
import { useProgression } from "@/components/providers/ProgressionContext";

export default function Home() {
  const { markAsVisited } = useProgression();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const handleNodeSelect = (id: string) => {
    setSelectedChapter(id);
    markAsVisited(id);
  };

  const handleClose = () => {
    setSelectedChapter(null);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#121212] flex">
      {/* 1. Fond Étoilé */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <StarBackground />
      </div>

      {/* 2. La Constellation */}
      <motion.div 
        className="relative z-10 h-full border-r border-[#457B9D]/20 flex-shrink-0"
        initial={false}
        animate={{ width: selectedChapter ? "50%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <ConstellationGraph 
          onNodeSelect={handleNodeSelect}
          selectedNodeId={selectedChapter}
        />
        
        {/* Titre */}
        <motion.div 
          className="absolute top-10 left-10 pointer-events-none z-20"
          initial={{ opacity: 1, x: 0 }}
          animate={{ 
            opacity: selectedChapter ? 0 : 1, 
            x: selectedChapter ? -50 : 0 
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
      </motion.div>

      {/* 3. Le Panneau Split Screen */}
      <AnimatePresence mode="wait">
        {selectedChapter && (
          <motion.div 
            key="panel"
            className="relative h-full z-20 bg-[#121212] overflow-hidden"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "50%", opacity: 1 }}
            exit={{ width: "0%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="w-[50vw] h-full">
               <ChapterPanel 
                 chapterId={selectedChapter} 
                 onClose={handleClose} 
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}