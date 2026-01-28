"use client";

import { useEffect, useRef, useState } from "react";
import { useProgression } from "@/components/providers/ProgressionContext";
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
  const unlockedNodes = progression?.unlockedNodes || ["les-racines"];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

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
    const scale = 1.5;
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
      if (distance < 15) {
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
    setHoveredNode(nodeId);

    if (nodeId && unlockedNodes.includes(nodeId)) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "default";
    }
  };

  // Rendu du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    // 2. Dessiner les nodes
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

      // Nodes verrouillés
      if (!isUnlocked) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#4a5568";
        ctx.fill();
        return;
      }

      // Nodes débloqués
      const radius = isHover || isSelected ? 14 : 10;

      // Effet de lueur si hover ou sélectionné
      if (isHover || isSelected) {
        ctx.shadowColor = "#E67E22";
        ctx.shadowBlur = 15;
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#E67E22";
      ctx.fill();

      ctx.shadowBlur = 0;

      // Cercle de sélection pulsant
      if (isSelected) {
        const elapsed = Date.now() % 1600;
        const cycle = (1 - Math.cos((elapsed / 400) * Math.PI)) / 2;
        const gap = 2 + cycle * 8;

        ctx.beginPath();
        ctx.arc(x, y, radius + gap, 0, 2 * Math.PI);
        ctx.strokeStyle = "#E67E22";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Texte (label)
      if (node.label) {
        const fontSize = isHover || isSelected ? 14 : 10;
        ctx.font = `${isHover || isSelected ? "bold" : ""} ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Contour noir
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = 3;
        ctx.strokeText(node.label, x, y);

        // Texte blanc
        ctx.fillStyle = "#F1FAEE";
        ctx.fillText(node.label, x, y);
      }
    });
  }, [dimensions, unlockedNodes, selectedNodeId, hoveredNode, isReady]);

  // Animation pour la pulsation du node sélectionné
  useEffect(() => {
    if (!selectedNodeId) return;

    const interval = setInterval(() => {
      setHoveredNode((prev) => prev);
    }, 50);

    return () => clearInterval(interval);
  }, [selectedNodeId]);

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
    </div>
  );
}
