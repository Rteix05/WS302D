"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type ProgressionContextType = {
  visitedNodes: string[];
  markAsVisited: (id: string) => void;
  isComplete: boolean;
};

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export function ProgressionProvider({ children }: { children: React.ReactNode }) {
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);

  // Charge la progression depuis le localStorage (pour ne pas perdre si on refresh)
  useEffect(() => {
    const saved = localStorage.getItem('webdoc-progression');
    if (saved) setVisitedNodes(JSON.parse(saved));
  }, []);

  const markAsVisited = (id: string) => {
    if (!visitedNodes.includes(id)) {
      const newVisited = [...visitedNodes, id];
      setVisitedNodes(newVisited);
      localStorage.setItem('webdoc-progression', JSON.stringify(newVisited));
    }
  };

  // On considère "Complet" si les 3 chapitres principaux sont vus
  const isComplete = ['eco-anxiete', 'quete-sens', 'adolescence'].every(id => 
    visitedNodes.includes(id)
  );

  return (
    <ProgressionContext.Provider value={{ visitedNodes, markAsVisited, isComplete }}>
      {children}
    </ProgressionContext.Provider>
  );
}

export const useProgression = () => {
  const context = useContext(ProgressionContext);
  if (!context) throw new Error("useProgression must be used within a ProgressionProvider");
  return context;
};