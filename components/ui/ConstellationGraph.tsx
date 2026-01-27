"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useProgression } from '@/components/providers/ProgressionContext';
import { nodesData, linksData } from '@/lib/data';

// Import dynamique pour éviter l'erreur SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface ConstellationGraphProps {
  onNodeSelect: (id: string) => void;
  selectedNodeId: string | null;
}

export default function ConstellationGraph({ onNodeSelect, selectedNodeId }: ConstellationGraphProps) {
  const { visitedNodes, isComplete } = useProgression();
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  
  // Timer pour gérer la durée de l'animation (2 cycles)
  const [selectionStartTime, setSelectionStartTime] = useState<number>(0);

  // Reset le timer quand on change de sélection
  useEffect(() => {
    if (selectedNodeId) {
       setSelectionStartTime(Date.now());
    }
  }, [selectedNodeId]);

  // Mise à jour de la taille basée sur le conteneur parent
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ w: clientWidth, h: clientHeight });
        }
      }
    };

    // Initial size check
    updateDimensions();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
         // Fallback to clientWidth/Height if contentRect is zero
         if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            setDimensions({ 
              w: entry.contentRect.width, 
              h: entry.contentRect.height 
            });
         } else {
            updateDimensions();
         }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // --- LOGIQUE DE CAMÉRA ---
  useEffect(() => {
    if (!graphRef.current) return;

    if (selectedNodeId) {
      const node = nodesData.find(n => n.id === selectedNodeId);
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        const zoomLevel = 2.5;
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(zoomLevel, 1000);
      }
    } else {
      // Force un re-centrage complet quand on revient à l'écran divisé
      // Le délai permet d'attendre que le conteneur ait fini sa transition de width
      setTimeout(() => {
          graphRef.current.zoomToFit(1000, 50);
      }, 350); 
    }
  }, [selectedNodeId, dimensions.w, dimensions.h]);

  // Filtrage des liens
  const activeLinks = useMemo(() => {
    return linksData.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      if (sourceId.startsWith('star') || targetId.startsWith('star')) return true;
      const sourceVisited = visitedNodes.includes(sourceId);
      const targetVisited = visitedNodes.includes(targetId);
      return (sourceVisited && targetVisited) || isComplete;
    });
  }, [visitedNodes, isComplete]);

  return (
    <div ref={containerRef} className="absolute inset-0 cursor-pointer overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={{ nodes: nodesData, links: activeLinks }}
        backgroundColor="rgba(0,0,0,0)"
        
        // Style des liens
        linkColor={() => "#457B9D"} 
        linkWidth={isComplete ? 2 : 1}
        
        // Bloquer le zoom et le pan
        enableZoom={false}
        enablePan={false}
        
        // Interaction souris
        onNodeHover={(node) => setHoveredNode(node)}
        onNodeClick={(node) => {
          if (node.id && !node.id.startsWith('star')) {
            onNodeSelect(node.id);
          }
        }}

        // Dessin des points (Canvas)
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isVisited = visitedNodes.includes(node.id);
          const isSelected = node.id === selectedNodeId;
          const isHover = node === hoveredNode;
          const isStar = node.id.startsWith('star');
          
          if (isStar) {
            // Rendu des étoiles (fond)
            ctx.beginPath();
            ctx.arc(node.x, node.y, 1.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            return;
          }

          // --- NOEUDS PRINCIPAUX (BOULES ORANGES) ---
          
          const baseRadius = 5; 
          const activeRadius = 6; 
          
          const isHighlight = isHover || isSelected;
          const currentRadius = isHighlight ? activeRadius : baseRadius;
          
          // Couleur
          const orangeColor = '#E67E22';
          const whiteColor = '#F1FAEE';

          // 1. EFFET "BREATHING RING" (Aller-Retour, 1 seul cycle)
          if (isSelected) {
             const now = Date.now();
             const elapsed = now - selectionStartTime;
             
             const period = Math.PI * 2 * 400;
             const maxDuration = period * 1; 

             if (elapsed < maxDuration) {
                 const cycle = (1 - Math.cos(elapsed / 400)) / 2; 
                 const gap = 2 + (cycle * 10);
                 const blur = 10 + (cycle * 15);

                 ctx.beginPath();
                 ctx.arc(node.x, node.y, currentRadius + gap, 0, 2 * Math.PI, false);
                 ctx.strokeStyle = orangeColor;
                 ctx.lineWidth = 2; 
                 ctx.stroke();
                 
                 ctx.shadowColor = orangeColor;
                 ctx.shadowBlur = blur;
             } else {
                 // Animation terminée : le contour disparaît
                 // On maintient juste un glow discret sur le point central
                 ctx.shadowColor = orangeColor;
                 ctx.shadowBlur = 10;
             }
          } else if (isHover) {
             ctx.shadowColor = orangeColor;
             ctx.shadowBlur = 15;
          } else {
             ctx.shadowBlur = 0;
          }

          // 2. CERCLE PRINCIPAL
          
          // Animation du cercle : petit battement
          let finalRadius = currentRadius;
          if (isSelected) {
             const elapsed = Date.now() - selectionStartTime;
             // On synchronise la durée avec l'anneau
             const period = Math.PI * 2 * 400;
             if (elapsed < period * 1) {
                // Petit pulse synchro avec l'anneau
                const cycle = (1 - Math.cos(elapsed / 400)) / 2;
                finalRadius += cycle * 1.5; 
             }
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(0, finalRadius), 0, 2 * Math.PI, false);
          ctx.fillStyle = orangeColor;
          ctx.fill();
          
          // Reset shadow
          ctx.shadowBlur = 0;

          // 3. TEXTE (Taille réduite, contour noir fin)
          if (node.label) {
            const fontSize = isHighlight ? 6 : 5; 
            ctx.font = `${isHighlight ? 'bold' : ''} ${fontSize}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Contour noir FIN
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 0.75; // Encore plus fin
            ctx.strokeText(node.label, node.x, node.y);
            
            // Texte Blanc
            ctx.fillStyle = whiteColor;
            ctx.fillText(node.label, node.x, node.y);
          }
        }}
      />
    </div>
  );
}