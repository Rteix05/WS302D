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
    const scale = 2.5;
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

          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);

          if (link.source.startsWith("star") || link.target.startsWith("star")) {
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1;
          } else if (isTargetUnlocked) {
            ctx.strokeStyle = "#457B9D";
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = "rgba(69, 123, 157, 0.2)";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
          }

          ctx.stroke();
          ctx.setLineDash([]);
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

        // --- GESTION DE L'ANIMATION DU RAYON ---
        // Définir la taille cible
        let targetRadius = 18; // Taille verrouillée par défaut
        if (isUnlocked) {
          targetRadius = isHover || isSelected ? 35 : 25;
        }

        // Initialiser l'état si inexistant ou incomplet (pour supporter le hot reload)
        if (!nodeAnimState.current[node.id]) {
          nodeAnimState.current[node.id] = {
            currentRadius: targetRadius,
            currentGap: 0,
          };
        }
        // Patch de sécurité si la propriété currentGap est manquante
        if (typeof nodeAnimState.current[node.id].currentGap === "undefined") {
          nodeAnimState.current[node.id].currentGap = 0;
        }

        // Interpolation linéaire (Lerp) pour une transition fluide
        const anim = nodeAnimState.current[node.id];
        // Vitesse de transition
        anim.currentRadius += (targetRadius - anim.currentRadius) * 0.15;

        // --- GESTION DU GAP (CERCLE DE SÉLECTION) ---
        let targetGap = 0;
        if (isSelected) {
          targetGap = 15; // Écart final quand sélectionné
        }

        // Si on n'est pas sélectionné mais qu'il y a du gap, on le réduit
        anim.currentGap += (targetGap - anim.currentGap) * 0.15;

        // Arrondir très proche pour éviter de l'oscillation inutile
        if (Math.abs(targetRadius - anim.currentRadius) < 0.1) {
          anim.currentRadius = targetRadius;
        }
        if (Math.abs(targetGap - anim.currentGap) < 0.1) {
          anim.currentGap = targetGap;
        }

        const radius = anim.currentRadius;
        // ---------------------------------------

        // Nodes verrouillés
        if (!isUnlocked) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
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
                  transform: `translate(-50%, ${isHover || isSelected ? "55px" : "40px"})`,
                  pointerEvents: "auto",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  color: "#F1FAEE",
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 10px rgba(0,0,0,0.5)",
                  fontSize: isHover || isSelected ? "24px" : "18px",
                  fontWeight: isHover || isSelected ? "bold" : "normal",
                  zIndex: 20,
                  textAlign: "center",
                  whiteSpace: "nowrap",
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
