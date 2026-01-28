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

// Les chapitres basés sur le document de cadrage (5 nœuds principaux)
export const nodesData: NodeData[] = [
  { id: 'les-racines', label: 'Les Racines', val: 15 },
  { id: 'le-vertige', label: 'Le Vertige', val: 15 },
  { id: 'la-boussole', label: 'La Boussole', val: 15 },
  { id: 'le-poids-du-monde', label: 'Le Poids du Monde', val: 15 },
  { id: 'nouveaux-horizons', label: 'Nouveaux Horizons', val: 15 },
  // Points décoratifs pour enrichir la constellation
  { id: 'star1', label: '', val: 2 },
  { id: 'star2', label: '', val: 3 },
  { id: 'star3', label: '', val: 2 },
  { id: 'star4', label: '', val: 2 },
  { id: 'star5', label: '', val: 2 },
];

// Les liens qui se dessineront au fur et à mesure
export const linksData: LinkData[] = [
  { source: 'les-racines', target: 'le-vertige' },
  { source: 'le-vertige', target: 'la-boussole' },
  { source: 'la-boussole', target: 'le-poids-du-monde' },
  { source: 'le-poids-du-monde', target: 'nouveaux-horizons' },
  { source: 'nouveaux-horizons', target: 'les-racines' },
  // Liens décoratifs
  { source: 'star1', target: 'les-racines' },
  { source: 'star2', target: 'le-vertige' },
  { source: 'star3', target: 'la-boussole' },
  { source: 'star4', target: 'le-poids-du-monde' },
  { source: 'star5', target: 'nouveaux-horizons' },
];

// Contenu pour les pages de chapitre (5 nœuds avec placeholder)
export const chaptersContent: Record<string, { title: string; text: string }> = {
  'les-racines': {
    title: "Les Racines",
    text: "Le passage de l'enfance à l'incertitude. Format : Photo-Audio. (Texte placeholder)",
  },
  'le-vertige': {
    title: "Le Vertige",
    text: "Le choc de l'éco-anxiété (Le froid numérique). Format : Vidéo (Cinemagraph). (Texte placeholder)",
  },
  'la-boussole': {
    title: "La Boussole",
    text: "La recherche de valeurs et de sens (La chaleur humaine). Format : Texte & Photo. (Texte placeholder)",
  },
  'le-poids-du-monde': {
    title: "Le Poids du Monde",
    text: "Les chiffres de la pression sociale et climatique. Format : Datavisualisation. (Texte placeholder)",
  },
  'nouveaux-horizons': {
    title: "Nouveaux Horizons",
    text: "L'élan vital et les projets de demain. Format : Motion / Texte. (Texte placeholder)",
  },
};