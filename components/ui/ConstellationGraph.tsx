"use client";

import { useEffect, useRef, useState } from "react";
import { useProgression } from "@/components/providers/ProgressionContext";
import { useSound } from "@/components/providers/SoundContext";
import { nodesData, linksData } from "@/lib/data";

interface ConstellationGraphProps {
  onNodeSelect: (id: string) => void;
  selectedNodeId: string | null;
}

export default function ConstellationGraph({
  onNodeSelect,
  selectedNodeId,
}: ConstellationGraphProps) {
  const progression = useProgression() as any;
  const { playClick, playHover } = useSound();
  const unlockedNodes = progression?.unlockedNodes || ["les-racines"];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // État d'animation pour effectuer des transitions fluides (rayon, gap)
  const nodeAnimState = useRef<
    Record<string, { currentRadius: number; currentGap: number }>
  >({});
  
  // NOUVEAU : Référence pour stocker le timestamp de "déblocage" de chaque node
  // Map<NodeID, Date.now()>
  const unlockTimestamps = useRef<Map<string, number>>(new Map());
  
  // Effet pour détecter les nouveaux déblocages
  useEffect(() => {
    unlockedNodes.forEach(id => {
      // Si on ne l'a pas déjà enregistré, c'est un nouveau déblocage (ou initial)
      if (!unlockTimestamps.current.has(id)) {
        // Pour "les-racines" (initial), on ne veut pas forcément d'anim, 
        // ou alors une anim rapide via un délai passé.
        // Mais pour simplifier : on marque le temps actuel.
        // Si c'est le chargement initial de la page, Date.now() est le même pour tous,
        // on pourrait différencier si on voulait les faire poper.
        unlockTimestamps.current.set(id, Date.now());
      }
    });
  }, [unlockedNodes]);

  // Mise à jour des dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const newDims = {
        w: window.innerWidth,
        h: window.innerHeight,
      };
      setDimensions(newDims);
      setIsReady(true);
    };

    // Attendre un peu pour que le DOM soit prêt
    const timer = setTimeout(updateDimensions, 100);
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Fonction pour convertir les coordonnées du graphe en coordonnées canvas
  const toCanvasCoords = (x: number, y: number) => {
    // Échelle dynamique responsive : 
    // - Desktop (>1000px) : 2.5
    // - Tablette (>600px) : 1.8
    // - Mobile : 1.2
    let scale = 2.5;
    if (dimensions.w < 600) {
      scale = 1.2;
    } else if (dimensions.w < 1000) {
      scale = 1.8;
    }

    const offsetX = dimensions.w / 2;
    const offsetY = dimensions.h / 2;
    return {
      x: offsetX + x * scale,
      y: offsetY + y * scale,
    };
  };

  // Fonction pour vérifier si on clique sur un node
  const getNodeAtPosition = (mouseX: number, mouseY: number) => {
    for (const node of nodesData) {
      if (!node.x || !node.y) continue;
      const { x, y } = toCanvasCoords(node.x, node.y);
      const distance = Math.sqrt(
        Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2),
      );
      // Augmentation de la zone de clic (40 -> 60) pour inclure un peu plus large (notamment vers le texte)
      if (distance < 60) {
        return node.id;
      }
    }
    return null;
  };

  // Gestion des clics
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const nodeId = getNodeAtPosition(mouseX, mouseY);
    if (
      nodeId &&
      unlockedNodes.includes(nodeId) &&
      !nodeId.startsWith("star")
    ) {
      playClick();
      onNodeSelect(nodeId);
    }
  };

  // Gestion du hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const nodeId = getNodeAtPosition(mouseX, mouseY);

    // Jouer le son si on survole un NOUVEAU node débloqué
    if (nodeId && nodeId !== hoveredNode && unlockedNodes.includes(nodeId)) {
      playHover();
    }

    setHoveredNode(nodeId);

    if (nodeId && unlockedNodes.includes(nodeId)) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "default";
    }
  };

  // Rendu du canvas (Animation Loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);

      // 1. Dessiner les liens
      linksData.forEach((link) => {
        const sourceNode = nodesData.find((n) => n.id === link.source);
        const targetNode = nodesData.find((n) => n.id === link.target);

        if (
          sourceNode &&
          targetNode &&
          sourceNode.x !== undefined &&
          sourceNode.y !== undefined &&
          targetNode.x !== undefined &&
          targetNode.y !== undefined
        ) {
          const source = toCanvasCoords(sourceNode.x, sourceNode.y);
          const target = toCanvasCoords(targetNode.x, targetNode.y);

          const isTargetUnlocked = unlockedNodes.includes(link.target);

          // Vérifier si une animation est en cours pour le target
          const unlockTime = unlockTimestamps.current.get(link.target);
          const now = Date.now();
          let progress = 1; // Par défaut 100%

          // Si on a un temps de déblocage, on calcule la progression
          if (unlockTime && isTargetUnlocked) {
            const duration = 1500; // 1.5 secondes pour tracer le trait
            progress = Math.min((now - unlockTime) / duration, 1);
          }

          // DESSIN DU FOND (Trait grisillé ou pointillé pour tous les liens connectés)
          // On dessine toujours le fond gris d'abord sauf pour les étoiles
          if (!(link.source.startsWith("star") || link.target.startsWith("star"))) {
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = "rgba(69, 123, 157, 0.2)";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash
          }

          // DESSIN DU TRAIT ACTIF (Par dessus)
          if (link.source.startsWith("star") || link.target.startsWith("star")) {
             // Traits étoiles déco
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (isTargetUnlocked) {
            // Calcul du point final en fonction de la progression
            const currentX = source.x + (target.x - source.x) * progress;
            const currentY = source.y + (target.y - source.y) * progress;

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = "#457B9D";
            ctx.lineWidth = 2;
            ctx.stroke();
          } 
        }
      });

      // 2. Dessiner les nodes avec interpolation
      nodesData.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;

        const { x, y } = toCanvasCoords(node.x, node.y);
        const isUnlocked = unlockedNodes.includes(node.id);
        const isSelected = node.id === selectedNodeId;
        const isHover = node.id === hoveredNode;
        const isStar = node.id.startsWith("star");

        // Étoiles décoratives
        if (isStar) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.fill();
          return;
        }

        // --- GESTION DU TIMING D'APPARITION ---
        const unlockTime = unlockTimestamps.current.get(node.id);
        const now = Date.now();
        const ANIMATION_DURATION = 1500;
        
        let visualUnlocked = isUnlocked;
        
        // Si le node est débloqué mais que le trait n'est pas encore arrivé (1.5s), on le garde "verrouillé" visuellement
        // Exception pour "les-racines" qui est le point de départ
        if (isUnlocked && node.id !== "les-racines" && unlockTime && (now - unlockTime < ANIMATION_DURATION)) {
          visualUnlocked = false;
        }

        // --- GESTION DE L'ANIMATION DU RAYON ---
        // Définir la taille cible
        let targetRadius = 18; // Taille verrouillée par défaut
        if (visualUnlocked) {
          targetRadius = isHover || isSelected ? 35 : 25;
        }

        // Initialiser l'état si inexistant ou incomplet
        if (!nodeAnimState.current[node.id]) {
          nodeAnimState.current[node.id] = {
            currentRadius: targetRadius,
            currentGap: 0,
          };
        }
        if (typeof nodeAnimState.current[node.id].currentGap === "undefined") {
          nodeAnimState.current[node.id].currentGap = 0;
        }

        // Interpolation
        const anim = nodeAnimState.current[node.id];
        anim.currentRadius += (targetRadius - anim.currentRadius) * 0.15;

        // Gap
        let targetGap = 0;
        if (isSelected) {
          targetGap = 15;
        }
        anim.currentGap += (targetGap - anim.currentGap) * 0.15;
        
        // Snap
        if (Math.abs(targetRadius - anim.currentRadius) < 0.1) anim.currentRadius = targetRadius;
        if (Math.abs(targetGap - anim.currentGap) < 0.1) anim.currentGap = targetGap;

        const radius = anim.currentRadius;
        // ---------------------------------------

        // Colors
        if (!visualUnlocked) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          // Gris foncé pour les nodes verrouillés (ou en attente du trait)
          ctx.fillStyle = "#4a5568"; 
          ctx.fill();
          return;
        }

        // Effet de lueur modulable
        if (radius > 26) {
          ctx.shadowColor = "#E67E22";
          ctx.shadowBlur = (radius - 25) * 3;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#E67E22";
        ctx.fill();

        ctx.shadowBlur = 0;

        // Cercle de sélection qui se détache et se fixe
        if (isSelected || anim.currentGap > 0.5) {
          // On ajoute le gap AU-DESSUS de la taille maximale du cercle (35), sinon il est caché par le rayon actuel
          // L'idée : Le cercle part du bord du node (radius) et s'écarte
          const gapRadius = radius + 5 + anim.currentGap;
          
          ctx.beginPath();
          ctx.arc(x, y, gapRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = "#E67E22";
          ctx.lineWidth = 2; // Un peu plus fin pour être élégant
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    // Lancer la boucle
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, unlockedNodes, selectedNodeId, hoveredNode, isReady]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {/* Overlay HTML pour les textes et Hitboxes */}
      {isReady &&
        nodesData.map((node) => {
          if (!node.label || node.x === undefined || node.y === undefined)
            return null;
          if (!unlockedNodes.includes(node.id)) return null;

          const { x, y } = toCanvasCoords(node.x, node.y);
          const isHover = node.id === hoveredNode;
          const isSelected = node.id === selectedNodeId;

          // Gestion du délai d'apparition du texte
          // Si c'est "les-racines" : immédiat
          // Sinon : délai de 1.5s (temps du trait)
          const isImmediate = node.id === "les-racines";
          const delayStyle = isImmediate ? {} : { animation: "fadeIn 0.5s ease-out 1.5s forwards", opacity: 0 };
          
          const isMobile = dimensions.w < 600;
          const labelFontSize = isHover || isSelected ? (isMobile ? "18px" : "24px") : (isMobile ? "14px" : "18px");
          const labelOffset = isHover || isSelected ? (isMobile ? "45px" : "55px") : (isMobile ? "30px" : "40px");

          return (
            <div key={node.id}>
              {/* ZONE DE CLIC (HITBOX) TRANSPARENTE SUR LE NOEUD */}
              <div
                onClick={() => {
                  playClick();
                  onNodeSelect(node.id);
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: "80px", // Zone de clic très large et confortable
                  height: "80px",
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                  zIndex: 25, // Au-dessus du canvas
                }}
              />

              {/* TEXTE LABEL */}
              <div
                onClick={() => {
                  playClick();
                  onNodeSelect(node.id);
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: `translate(-50%, ${labelOffset})`,
                  pointerEvents: "auto",
                  cursor: "pointer",
                  transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), font-size 0.4s ease",
                  color: "#F1FAEE",
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 10px rgba(0,0,0,0.5)",
                  fontSize: labelFontSize,
                  fontWeight: isHover || isSelected ? "bold" : "normal",
                  zIndex: 20,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  ...delayStyle
                }}
              >
                {node.label}
              </div>
            </div>
          );
        })}
    </div>
  );
}
