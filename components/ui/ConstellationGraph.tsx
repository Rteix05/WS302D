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
  
  const unlockTimestamps = useRef<Map<string, number>>(new Map());
  
  useEffect(() => {
    unlockedNodes.forEach((id: string) => {
      if (!unlockTimestamps.current.has(id)) {
        unlockTimestamps.current.set(id, Date.now());
      }
    });
  }, [unlockedNodes]);

  // --- MODIFICATION ICI : Gestion du redimensionnement via ResizeObserver ---
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
        setIsReady(true);
      }
    };

    // Initialisation
    updateDimensions();

    // Observer les changements de taille du conteneur parent
    const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []); // Plus besoin de window "resize" listener global

  // Fonction pour convertir les coordonnées du graphe en coordonnées canvas
  const toCanvasCoords = (x: number, y: number) => {
    // Échelle dynamique responsive
    let scale = 2.5;
    if (dimensions.w < 600) {
      scale = 1.2;
    } else if (dimensions.w < 1000) {
      // Si on est en split screen (petit width), on réduit un peu l'échelle
      scale = 1.8;
    }

    const offsetX = dimensions.w / 2;
    const offsetY = dimensions.h / 2;
    return {
      x: offsetX + x * scale,
      y: offsetY + y * scale,
    };
  };

  // ... (Le reste des fonctions : getNodeAtPosition, handleClick, handleMouseMove restent inchangées)
  // Je remets les fonctions pour que le fichier soit complet et fonctionnel sans erreur de copie

  const getNodeAtPosition = (mouseX: number, mouseY: number) => {
    for (const node of nodesData) {
      if (!node.x || !node.y) continue;
      const { x, y } = toCanvasCoords(node.x, node.y);
      const distance = Math.sqrt(
        Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2),
      );
      if (distance < 60) {
        return node.id;
      }
    }
    return null;
  };

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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const nodeId = getNodeAtPosition(mouseX, mouseY);

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
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);

      linksData.forEach((link) => {
        const sourceNode = nodesData.find((n) => n.id === link.source);
        const targetNode = nodesData.find((n) => n.id === link.target);

        if (
          sourceNode?.x !== undefined && sourceNode?.y !== undefined &&
          targetNode?.x !== undefined && targetNode?.y !== undefined
        ) {
          const source = toCanvasCoords(sourceNode.x, sourceNode.y);
          const target = toCanvasCoords(targetNode.x, targetNode.y);

          const isTargetUnlocked = unlockedNodes.includes(link.target);
          const unlockTime = unlockTimestamps.current.get(link.target);
          const now = Date.now();
          let progress = 1;

          if (unlockTime && isTargetUnlocked) {
            const duration = 1500;
            progress = Math.min((now - unlockTime) / duration, 1);
          }

          // Fond pointillé
          if (!(link.source.startsWith("star") || link.target.startsWith("star"))) {
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = "rgba(69, 123, 157, 0.2)";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Trait actif
          if (link.source.startsWith("star") || link.target.startsWith("star")) {
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (isTargetUnlocked) {
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

      nodesData.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;

        const { x, y } = toCanvasCoords(node.x, node.y);
        const isUnlocked = unlockedNodes.includes(node.id);
        const isSelected = node.id === selectedNodeId;
        const isHover = node.id === hoveredNode;
        const isStar = node.id.startsWith("star");

        if (isStar) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.fill();
          return;
        }

        const unlockTime = unlockTimestamps.current.get(node.id);
        const now = Date.now();
        const ANIMATION_DURATION = 1500;
        
        let visualUnlocked = isUnlocked;
        if (isUnlocked && node.id !== "les-racines" && unlockTime && (now - unlockTime < ANIMATION_DURATION)) {
          visualUnlocked = false;
        }

        let targetRadius = 18;
        if (visualUnlocked) {
          targetRadius = isHover || isSelected ? 35 : 25;
        }

        if (!nodeAnimState.current[node.id]) {
          nodeAnimState.current[node.id] = { currentRadius: targetRadius, currentGap: 0 };
        }
        
        const anim = nodeAnimState.current[node.id];
        anim.currentRadius += (targetRadius - anim.currentRadius) * 0.15;
        
        let targetGap = isSelected ? 15 : 0;
        anim.currentGap += (targetGap - anim.currentGap) * 0.15;

        const radius = anim.currentRadius;

        if (!visualUnlocked) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = "#4a5568"; 
          ctx.fill();
          return;
        }

        if (radius > 26) {
          ctx.shadowColor = "#E67E22";
          ctx.shadowBlur = (radius - 25) * 3;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#E67E22";
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isSelected || anim.currentGap > 0.5) {
          const gapRadius = radius + 5 + anim.currentGap;
          ctx.beginPath();
          ctx.arc(x, y, gapRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = "#E67E22";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, unlockedNodes, selectedNodeId, hoveredNode, isReady]);

  // --- MODIFICATION ICI : Style à 100% pour remplir le conteneur variable ---
  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",  // Remplace 100vw
        height: "100%", // Remplace 100vh
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {/* Overlay HTML (inchangé sauf dépendance à dimensions.w qui est auto) */}
      {isReady && nodesData.map((node) => {
          if (!node.label || node.x === undefined || node.y === undefined) return null;
          if (!unlockedNodes.includes(node.id)) return null;

          const { x, y } = toCanvasCoords(node.x, node.y);
          const isHover = node.id === hoveredNode;
          const isSelected = node.id === selectedNodeId;
          const isImmediate = node.id === "les-racines";
          const delayStyle = isImmediate ? {} : { animation: "fadeIn 0.5s ease-out 1.5s forwards", opacity: 0 };
          const isMobile = dimensions.w < 600;
          const labelFontSize = isHover || isSelected ? (isMobile ? "18px" : "24px") : (isMobile ? "14px" : "18px");
          const labelOffset = isHover || isSelected ? (isMobile ? "45px" : "55px") : (isMobile ? "30px" : "40px");

          return (
            <div key={node.id}>
              {/* Hitbox */}
              <div
                onClick={() => { playClick(); onNodeSelect(node.id); }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  position: "absolute", left: x, top: y, width: "80px", height: "80px",
                  borderRadius: "50%", transform: "translate(-50%, -50%)", cursor: "pointer", zIndex: 25,
                }}
              />
              {/* Label */}
              <div
                onClick={() => { playClick(); onNodeSelect(node.id); }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  position: "absolute", left: x, top: y,
                  transform: `translate(-50%, ${labelOffset})`, pointerEvents: "auto", cursor: "pointer",
                  transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), font-size 0.4s ease",
                  color: "#F1FAEE", textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 10px rgba(0,0,0,0.5)",
                  fontSize: labelFontSize, fontWeight: isHover || isSelected ? "bold" : "normal",
                  zIndex: 20, textAlign: "center", whiteSpace: "nowrap", ...delayStyle
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