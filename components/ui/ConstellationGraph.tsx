"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useProgression } from '@/components/providers/ProgressionContext';
import { nodesData, linksData } from '@/lib/data';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface ConstellationGraphProps {
  onNodeSelect: (id: string) => void;
  selectedNodeId: string | null;
}

export default function ConstellationGraph({ onNodeSelect, selectedNodeId }: ConstellationGraphProps) {
  const { visitedNodes, isComplete } = useProgression();
  
  // CORRECTION ICI : On initialise avec (null) pour satisfaire TypeScript
  const graphRef = useRef<any>(null);
  
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  useEffect(() => {
    // Sécurité : vérification que window existe
    if (typeof window !== 'undefined') {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
      const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // --- LOGIQUE DE CAMÉRA ---
  useEffect(() => {
    if (!graphRef.current) return;

    if (selectedNodeId) {
      const node = nodesData.find(n => n.id === selectedNodeId);
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        
        // On veut voir le point sur la GAUCHE de l'écran.
        const zoomLevel = 2.5;
        const shiftX = (dimensions.w / 4) / zoomLevel; 
        
        graphRef.current.centerAt(node.x + shiftX, node.y, 1000);
        graphRef.current.zoom(zoomLevel, 1000);
      }
    } else {
      graphRef.current.zoomToFit(1000, 50);
    }
  }, [selectedNodeId, dimensions.w]);

  const activeLinks = useMemo(() => {
    return linksData.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as