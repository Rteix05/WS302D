// lib/data.ts

export type NodeData = {
  id: string;
  label: string;
  x?: number; // Position optionnelle, le graphe peut gérer auto
  y?: number;
  val: number; // Taille du point
};

export type LinkData = {
  source: string;
  target: string;
};

// Les chapitres basés sur le document de cadrage (p.4-5)
export const nodesData: NodeData[] = [
  { id: 'eco-anxiete', label: 'Éco-Anxiété', val: 15 },
  { id: 'quete-sens', label: 'Quête de Sens', val: 15 },
  { id: 'adolescence', label: 'Adolescence', val: 15 },
  // Points décoratifs pour enrichir la constellation
  { id: 'star1', label: '', val: 2 },
  { id: 'star2', label: '', val: 3 },
  { id: 'star3', label: '', val: 2 },
  { id: 'star4', label: '', val: 2 },
];

// Les liens qui se dessineront au fur et à mesure
export const linksData: LinkData[] = [
  { source: 'eco-anxiete', target: 'quete-sens' },
  { source: 'quete-sens', target: 'adolescence' },
  { source: 'adolescence', target: 'eco-anxiete' },
  // Liens décoratifs
  { source: 'star1', target: 'eco-anxiete' },
  { source: 'star2', target: 'quete-sens' },
];

// Contenu fictif pour les pages de chapitre
export const chaptersContent: Record<string, { title: string; text: string }> = {
  'eco-anxiete': {
    title: "Éco-Anxiété",
    text: "Face à l'urgence climatique, une angoisse sourde s'installe. Mais cette peur est-elle paralysante ou devient-elle un moteur d'action ? (Texte placeholder)",
  },
  'quete-sens': {
    title: "Quête de Sens",
    text: "Pourquoi se lever le matin quand l'horizon semble bouché ? La recherche d'un travail qui a du sens remplace la quête de statut. (Texte placeholder)",
  },
  'adolescence': {
    title: "Adolescence",
    text: "Entre insouciance perdue et maturité forcée, comment se construire quand on a 20 ans aujourd'hui ? (Texte placeholder)",
  },
};