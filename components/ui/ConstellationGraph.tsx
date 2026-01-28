"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useProgression } from '@/components/providers/ProgressionContext';
import { nodesData, linksData } from '@/lib/data';

// Import dynamique pour éviter les erreurs serveur (SSR)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface ConstellationGraphProps {
  onNodeSelect: (id: string) => void;
  selectedNodeId: string | null;
}

export default function ConstellationGraph({ onNodeSelect, selectedNodeId }: ConstellationGraphProps) {
  // 1. Récupération des données avec sécurités (fallback tableaux vides)
  const progression = useProgression() as any;
  const unlockedNodes = progression?.unlockedNodes || ['les-racines'];
  const visitedNodes = progression?.visitedNodes || [];

  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectionStartTime, setSelectionStartTime] = useState<number>(0);

  // Gestion du timer d'animation de sélection
  useEffect(() => {
    if (selectedNodeId) {
       setSelectionStartTime(Date.now());
    }
  }, [selectedNodeId]);

  // Gestion redimensionnement fenêtre
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({ 
            w: containerRef.current.clientWidth, 
            h: containerRef.current.clientHeight 
        });
      }
    };
    
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Caméra / Zoom automatique
  useEffect(() => {
    if (!graphRef.current) return;
    
    if (selectedNodeId) {
      const node = nodesData.find(n => n.id === selectedNodeId);
      if (node && typeof node.x === 'number') {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2.5, 1000);
      }
    } else {
      setTimeout(() => {
          graphRef.current?.zoomToFit(1000, 50);
      }, 500); 
    }
  }, [selectedNodeId, dimensions.w]);

  // Helper : Convertir ID en string pour éviter crashs
  const safeId = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'object' && val.id) return String(val.id);
    return String(val);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-transparent">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={{ nodes: nodesData, links: linksData }}
        backgroundColor="rgba(0,0,0,0)"
        
        // --- LIENS ---
        linkColor={(link: any) => {
            const source = safeId(link.source);
            const target = safeId(link.target);
            
            if (source.startsWith('star') || target.startsWith('star')) return "rgba(255,255,255,0.1)"; 
            
            const isTargetUnlocked = unlockedNodes.includes(target);
            return isTargetUnlocked ? "#457B9D" : "rgba(69, 123, 157, 0.2)";
        }}
        linkWidth={(link: any) => {
            const target = safeId(link.target);
            return unlockedNodes.includes(target) ? 2 : 1;
        }}
        linkLineDash={(link: any) => {
            const source = safeId(link.source);
            const target = safeId(link.target);
            if (source.startsWith('star')) return null;
            return unlockedNodes.includes(target) ? null : [5, 5]; 
        }}
        
        // @ts-ignore
        enableZoom={false}
        // @ts-ignore
        enablePan={false}
        
        // --- INTERACTION ---
        onNodeHover={(node: any) => {
            const id = safeId(node);
            if (id && unlockedNodes.includes(id)) {
                setHoveredNode(node);
                document.body.style.cursor = 'pointer';
            } else {
                setHoveredNode(null);
                document.body.style.cursor = 'default';
            }
        }}
        
        onNodeClick={(node: any) => {
          const id = safeId(node);
          if (id && unlockedNodes.includes(id) && !id.startsWith('star')) {
            onNodeSelect(id);
          }
        }}

        // --- DESSIN ---
        nodeCanvasObject={(node: any, ctx) => {
          const id = safeId(node);
          if (!id) return; 

          const isUnlocked = unlockedNodes.includes(id);
          const isSelected = id === selectedNodeId;
          const isHover = (hoveredNode && safeId(hoveredNode) === id);
          const isStar = id.startsWith('star');
          
          // 1. ÉTOILES DÉCO
          if (isStar) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 1.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            return;
          }

          // 2. VERROUILLÉ (Gris)
          if (!isUnlocked) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
              ctx.fillStyle = '#4a5568';
              ctx.fill();
              return; 
          }

          // 3. DÉBLOQUÉ (Orange)
          const baseRadius = 5; 
          const activeRadius = 7; 
          const currentRadius = (isHover || isSelected) ? activeRadius : baseRadius;
          const orangeColor = '#E67E22';
          const whiteColor = '#F1FAEE';

          // Pulsation si sélectionné
          if (isSelected) {
             const now = Date.now();
             const elapsed = now - selectionStartTime;
             const cycle = (1 - Math.cos(elapsed / 400)) / 2; 
             const gap = 2 + (cycle * 8);
             
             ctx.beginPath();
             ctx.arc(node.x, node.y, currentRadius + gap, 0, 2 * Math.PI, false);
             ctx.strokeStyle = orangeColor;
             ctx.lineWidth = 1.5; 
             ctx.stroke();
          } 
          
          if (isHover || isSelected) {
             ctx.shadowColor = orangeColor;
             ctx.shadowBlur = 15;
          } else {
             ctx.shadowBlur = 0;
          }

          // Cercle
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius, 0, 2 * Math.PI, false);
          ctx.fillStyle = orangeColor;
          ctx.fill();
          ctx.shadowBlur = 0;

          // 4. TEXTE (MODIFIÉ : Centré sur le noeud)
          if (node.label) {
            const fontSize = (isHover || isSelected) ? 7 : 5; 
            ctx.font = `${(isHover || isSelected) ? 'bold' : ''} ${fontSize}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Contour noir plus épais pour bien lire le texte par dessus le point orange
            ctx.strokeStyle = 'rgba(0,0,0,0.9)';
            ctx.lineWidth = 0.75; 
            ctx.strokeText(node.label, node.x, node.y); // <-- node.y (centré) au lieu de node.y + 12
            
            // Texte blanc
            ctx.fillStyle = whiteColor;
            ctx.fillText(node.label, node.x, node.y); // <-- node.y (centré)
          }
        }}
      />
    </div>
  );
}