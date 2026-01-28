"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { unlockingRules } from '@/lib/data';

type ProgressionContextType = {
  visitedNodes: string[];
  unlockedNodes: string[];
  markAsVisited: (id: string) => void;
  unlockNext: (currentId: string) => void;
  isComplete: boolean;
};

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export function ProgressionProvider({ children }: { children: React.ReactNode }) {
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [unlockedNodes, setUnlockedNodes] = useState<string[]>(['les-racines']);

  useEffect(() => {
    // 1. Chargement Visites
    try {
      const savedVisited = localStorage.getItem('webdoc-visited');
      if (savedVisited) setVisitedNodes(JSON.parse(savedVisited));
    } catch (e) {}

    // 2. Chargement Déblocages (avec auto-réparation)
    try {
      const savedUnlocked = localStorage.getItem('webdoc-unlocked');
      if (savedUnlocked) {
        const parsed = JSON.parse(savedUnlocked);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUnlockedNodes(parsed);
        } else {
          setUnlockedNodes(['les-racines']);
        }
      } else {
        setUnlockedNodes(['les-racines']);
      }
    } catch (e) {
      setUnlockedNodes(['les-racines']);
    }
  }, []);

  const markAsVisited = (id: string) => {
    if (!visitedNodes.includes(id)) {
      const newVisited = [...visitedNodes, id];
      setVisitedNodes(newVisited);
      localStorage.setItem('webdoc-visited', JSON.stringify(newVisited));
    }
  };

  const unlockNext = (currentId: string) => {
    // 1. Récupérer les déblocages standards (depuis data.ts)
    const nextIds = unlockingRules[currentId] || [];
    let newIdsToAdd = [...nextIds];

    // 2. RÈGLE SPÉCIALE : LOGIQUE DU DIAMANT
    // Pour débloquer 'nouveaux-horizons' (5), il faut avoir vu :
    // - 'la-boussole' (3)
    // - ET 'poids-monde' (4)
    
    // On vérifie l'état actuel des visites (+ celui qu'on vient de finir)
    const hasVisited3 = visitedNodes.includes('la-boussole') || currentId === 'la-boussole';
    const hasVisited4 = visitedNodes.includes('poids-monde') || currentId === 'poids-monde';

    if (hasVisited3 && hasVisited4) {
      newIdsToAdd.push('nouveaux-horizons');
    }

    // 3. Appliquer les changements s'il y en a
    if (newIdsToAdd.length > 0) {
      const newUnlocked = Array.from(new Set([...unlockedNodes, ...newIdsToAdd]));
      setUnlockedNodes(newUnlocked);
      localStorage.setItem('webdoc-unlocked', JSON.stringify(newUnlocked));
    }
  };

  const isComplete = visitedNodes.includes('message-de-fin');

  return (
    <ProgressionContext.Provider value={{ visitedNodes, unlockedNodes, markAsVisited, unlockNext, isComplete }}>
      {children}
    </ProgressionContext.Provider>
  );
}

export const useProgression = () => {
  const context = useContext(ProgressionContext);
  if (!context) throw new Error("useProgression must be used within a ProgressionProvider");
  return context;
};