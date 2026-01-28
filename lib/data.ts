// lib/data.ts

export type NodeData = {
  id: string;
  label: string;
  x?: number;
  y?: number;
  val: number; 
};

export type LinkData = {
  source: string;
  target: string;
};

// 1. LES NOEUDS
export const nodesData: NodeData[] = [
  { id: 'les-racines', label: 'Les Racines', val: 20, x: -150, y: 80 },        
  { id: 'le-vertige', label: 'Le Vertige', val: 20, x: -80, y: -20 },          
  { id: 'la-boussole', label: 'La Boussole', val: 20, x: 20, y: 50 },          
  { id: 'poids-monde', label: 'Le Poids du Monde', val: 20, x: 80, y: -60 },   
  { id: 'nouveaux-horizons', label: 'Nouveaux Horizons', val: 20, x: 180, y: -20 }, 
  { id: 'message-de-fin', label: 'Merci !', val: 25, x: 260, y: 40 },

  // Décoration
  { id: 'star1', label: '', val: 2, x: -180, y: -90 },
  { id: 'star2', label: '', val: 2, x: 0, y: -120 },
  { id: 'star3', label: '', val: 2, x: 120, y: 90 },
  { id: 'star4', label: '', val: 2, x: 200, y: 60 },
];

// 2. LES LIENS
export const linksData: LinkData[] = [
  { source: 'les-racines', target: 'le-vertige' },
  { source: 'le-vertige', target: 'la-boussole' },
  { source: 'le-vertige', target: 'poids-monde' },
  { source: 'la-boussole', target: 'nouveaux-horizons' },
  { source: 'poids-monde', target: 'nouveaux-horizons' },
  { source: 'nouveaux-horizons', target: 'message-de-fin' },

  // Liens déco
  { source: 'star1', target: 'le-vertige' },
  { source: 'star2', target: 'poids-monde' },
  { source: 'star3', target: 'la-boussole' },
  { source: 'star4', target: 'nouveaux-horizons' },
];

// 3. RÈGLES DE DÉBLOCAGE (LOGIQUE DIAMANT)
// Note : 'la-boussole' et 'poids-monde' sont vides ici car on gère
// leur condition spéciale (ET) directement dans ProgressionContext.tsx
export const unlockingRules: Record<string, string[]> = {
  'les-racines': ['le-vertige'],
  'le-vertige': ['la-boussole', 'poids-monde'],
  'la-boussole': [], // Vide pour l'instant (géré par code)
  'poids-monde': [], // Vide pour l'instant (géré par code)
  'nouveaux-horizons': ['message-de-fin']
};

// 4. LE CONTENU
export const chaptersContent: Record<string, { title: string; text: string }> = {
  'les-racines': {
    title: "LES RACINES",
    text: "Le passage de l'enfance à l'incertitude. Comment s'ancrer quand le sol semble se dérober sous nos pieds ? Une exploration photo-audio de nos origines."
  },
  'le-vertige': {
    title: "LE VERTIGE",
    text: "Le choc de l'éco-anxiété (Le froid numérique). Face à l'urgence, une sensation de chute libre. La paralysie guette, mais la prise de conscience est brutale."
  },
  'la-boussole': {
    title: "LA BOUSSOLE",
    text: "La recherche de valeurs et de sens (La chaleur humaine). Au milieu de la tempête, trouver un cap. Redéfinir ce qui compte vraiment, loin du bruit médiatique."
  },
  'poids-monde': {
    title: "LE POIDS DU MONDE",
    text: "Les chiffres de la pression sociale et climatique. Une visualisation brute des responsabilités qui pèsent sur une seule génération."
  },
  'nouveaux-horizons': {
    title: "NOUVEAUX HORIZONS",
    text: "L'élan vital et les projets de demain. Transformer l'angoisse en action. L'histoire ne s'arrête pas là, elle commence à peine."
  },
  'message-de-fin': {
    title: "MERCI !",
    text: "Merci d'avoir exploré ce voyage avec nous. N'oubliez pas, chaque petit geste compte dans la grande aventure de notre planète."
  }
};