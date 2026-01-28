// lib/data.ts

export type NodeData = {
  id: string;
  label: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  val: number;
};

export type LinkData = {
  source: string;
  target: string;
};

// 1. LES NOEUDS (CENTRÉS AUTOUR DE 0,0)
export const nodesData: NodeData[] = [
  {
    id: "les-racines",
    label: "Les Racines",
    val: 20,
    x: -150,
    y: 10,
  },
  {
    id: "le-vertige",
    label: "Le Vertige",
    val: 20,
    x: -50,
    y: -50,
  },
  {
    id: "la-boussole",
    label: "La Boussole",
    val: 20,
    x: 20,
    y: 20,
  },
  {
    id: "poids-monde",
    label: "Le Poids du Monde",
    val: 20,
    x: 50,
    y: -80,
  },
  {
    id: "nouveaux-horizons",
    label: "Nouveaux Horizons",
    val: 20,
    x: 120,
    y: -30,
  },
  {
    id: "message-de-fin",
    label: "Merci !",
    val: 25,
    x: 180,
    y: 0,
  },

  // Décoration
  { id: "star1", label: "", val: 2, x: -180, y: -90 },
  { id: "star2", label: "", val: 2, x: 0, y: -110 },
  { id: "star3", label: "", val: 2, x: 80, y: 60 },
  { id: "star4", label: "", val: 2, x: 150, y: 40 },
];

// 2. LES LIENS
export const linksData: LinkData[] = [
  { source: "les-racines", target: "le-vertige" },
  { source: "le-vertige", target: "la-boussole" },
  { source: "le-vertige", target: "poids-monde" },
  { source: "la-boussole", target: "nouveaux-horizons" },
  { source: "poids-monde", target: "nouveaux-horizons" },
  { source: "nouveaux-horizons", target: "message-de-fin" },

  // Liens déco
  { source: "star1", target: "le-vertige" },
  { source: "star2", target: "poids-monde" },
  { source: "star3", target: "la-boussole" },
  { source: "star4", target: "nouveaux-horizons" },
];

// 3. RÈGLES DE DÉBLOCAGE (LOGIQUE DIAMANT)
// Note : 'la-boussole' et 'poids-monde' sont vides ici car on gère
// leur condition spéciale (ET) directement dans ProgressionContext.tsx
export const unlockingRules: Record<string, string[]> = {
  "les-racines": ["le-vertige"],
  "le-vertige": ["la-boussole", "poids-monde"],
  "la-boussole": [], // Vide pour l'instant (géré par code)
  "poids-monde": [], // Vide pour l'instant (géré par code)
  "nouveaux-horizons": ["message-de-fin"],
};

// 4. LE CONTENU
// lib/data.ts

export type ChapterContent = {
  title: string;
  text: string;
  image?: string; // URL de l'image
  video?: string; // URL de la vidéo (MP4)
  voiceover?: string; // URL du lecteur audio (témoignage)
  bgMusic?: string; // URL de la nappe sonore (drone loop)
  iframe?: string; // URL pour la datavisualisation
};

export const chaptersContent: Record<string, ChapterContent> = {
  "les-racines": {
    title: "LES RACINES",
    text: "\"Avant, l'horizon était une ligne droite. On nous disait que le monde nous appartenait. Aujourd'hui, cette ligne tremble. Les racines sont là, mais le sol, lui, semble se dérober.\"\n\nL'adolescence est le moment où la construction de soi percute la réalité du monde. C'est ici que naît la première fracture : celle entre la sécurité du foyer et le vertige d'un futur que l'on ne maîtrise plus.\n\n Comment projeter son propre avenir quand l'éco-anxiété devient le nouveau bruit de fond de nos vies ?",
    image: "/images/noeuds/racine.jpg",
    voiceover: "/audio/vo/racine-voiceover.mp3",
    bgMusic: "/audio/vo/racine-background.mp3",
  },
  "le-vertige": {
    title: "LE VERTIGE",
    text: "Le smartphone n'est plus un simple outil de communication : pour la génération 18-25 ans, il est devenu une fenêtre béante sur l'effondrement global.\n\n Dans l'obscurité d'une chambre, la lumière bleue ne se contente pas d'éclairer un visage ; elle diffuse un flux continu d'alertes qui saturent l'esprit.\n\n Ce \"scroll\" infini n'est pas une simple passivité. C'est une confrontation brutale avec l'éco-anxiété.\n\n L\’alerte permanente : Chaque titre sur le dérèglement climatique ou l'extinction des espèces agit comme une micro-agression cognitive, renforçant ce sentiment d'être \"suspendu\" face à un futur incertain.\n\n Le paradoxe de l'information : Être la génération la plus connectée de l'histoire signifie porter la charge mentale d'un monde en crise, tout en étant physiquement seul face à son écran.\n\n La saturation : Ce vertige est le point de bascule où le trop-plein d'informations paralyse l'action.\n\n On devient, malgré soi, le spectateur impuissant d'un désastre que l'on nous demande pourtant de réparer. « L'incertitude est le moteur d'une nouvelle forme d'engagement, mais elle commence souvent par ce silence lourd devant la lumière froide des écrans. »",
    video: "/video/vertige.mp4",
  },
  "la-boussole": {
    title: "LA BOUSSOLE",
    text: "\“Je suis engagée depuis plus de trois ans dans le mouvement écologiste. L\’écoanxiété est arrivée avec. J\’en souffre régulièrement. L\’état dans lequel nous laissons entrevoir notre futur n\’est pas acceptable. Il m\’arrive parfois de me dire que se battre ne sert plus à rien, qu\’il faut abandonner et arrêter de donner de l\’énergie pour un combat déjà perdu.\n\n Ce sentiment me poursuit au quotidien, dans tous les aspects de ma vie. J\’ai changé mon alimentation et ma façon de voir les choses. Je ne souhaite pas avoir d\’enfant, je ne veux pas laisser quelqu\’un vivre dans le monde que nous sommes en train de bâtir. J\’essaye pourtant de garder de l\’espoir.\n\n Si l\’écoanxiété touche tous les militants écologistes un jour ou l\’autre, nous nous remotivons toujours et continuons le combat.\”\n\n Marina, 19 ans",
    image: "/images/noeuds/boussole.jpg",
    bgMusic: "/audio/vo/boussole-background.mp3",
  },
  "poids-monde": {
    title: "LE POIDS DU MONDE",
    text: `1. Le Poids Écologique (L'Avenir Suspendu)
Le Sentiment d'Insécurité : En 2025, 32 % des 15-24 ans en France sont
considérés comme éco-anxieux (allant de symptômes modérés à sévères).\n\n
L'Avenir comme Menace : 75 % des jeunes jugent le futur "effrayant" à cause
de la crise climatique.\n\n
L'Impact sur les Choix de Vie : Les jeunes sont plus inquiets de l'impact de
leurs propres comportements sur l'environnement que les générations précédentes.\n\n
2. Le Poids Académique et Social (La Pression de Réussite)
L'Angoisse de la Performance : 59 % des adolescents et étudiants se disent
angoissés par les notes et les examens.\n\n
La Peur de l'Échec : Un jeune sur deux (50 %) pense souvent qu'il va échouer
à un examen ou à un entretien.\n\n
L'Image de Soi : 62 % des 11-24 ans craignent l'échec global et 56 % ont
peur de se tromper de voie.\n\n
3. Le Poids de la Précarité (La Réalité Brute)\n\n
Le Reste à Vivre : En 2024, 27 % des étudiants vivent avec moins de 50 euros
de reste à vivre par mois après paiement des charges fixes.\n\n
L'Insécurité Alimentaire : 18 % des étudiants ont déjà eu recours à l'aide
alimentaire, et un sur deux (50 %) a déjà sauté un repas par manque d'argent.\n\n
La Solitude Économique : 41 % des étudiants déclarent se sentir seuls, un
sentiment directement lié au manque de ressources (impossibilité de sortir, de
faire des activités).\n\n
4. La Santé Mentale (Le Miroir des Pressions)
Un Constat Global : 55 % des 18-24 ans ont déjà été affectés par un problème
de santé mentale (anxiété chronique, dépression).\n\n
Le Désir d'Abandon : Chez les jeunes femmes de 11 à 24 ans, 32 % ressentent
l'envie de "tout abandonner" face à la pression sociétale.\n\n
Le Recours aux Soins : Bien que 35 % des 18-24 ans estiment ne pas prendre
soin de leur santé mentale, plus d'un sur deux ne consulte pas de professionnel
par manque de moyens ou barrières culturelles.
\n\n
Sources :
1. Éco-anxiété et Poids Climatique
Étude internationale de référence : The Lancet Planetary Health (Hickman et
al., 2021). C’est l’étude qui a révélé que 75 % des 16-25 ans jugent le futur «
effrayant » et que 56 % estiment que l’humanité est condamnée.\n\n
Contexte français (2025) : Rapport de l’ADEME sur l’éco-anxiété en France
(parution avril 2025). Il précise qu'environ 1 Français sur 4 est concerné, les
15-24 ans étant particulièrement exposés aux premiers symptômes.\n\n
2. Précarité Étudiante
Étude annuelle Linkee : Rapport "Avoir 20 ans en 2024/2025". Cette source
indique que 78 % des étudiants bénéficiaires de l'aide alimentaire disposent de
moins de 100 € de reste à vivre par mois.\n\n
Reste à vivre extrême : Selon l'enquête Linkee 2025, plus de la moitié des
étudiants en situation de précarité ont moins de 50 € par mois une fois leurs
charges payées (soit moins de 1,67 € par jour).\n\n
Étude Union Étudiante (2026) : Chiffre confirmant qu'un étudiant sur trois
vit sous le seuil critique de 50 € de reste à vivre mensuel.\n\n
3. Pression Académique et Sociale
Baromètre des adolescents Ipsos (2024) : Intitulé "Notre avenir à tous", ce
rapport montre que 59 % des adolescents sont angoissés par les notes et les
évaluations.\n\n
Étude Institut Montaigne (2025) : Rapport sur la santé mentale des jeunes
indiquant que 87 % des jeunes se disent stressés par leurs études.\n\n
Sondage CSA / Dotmap (2024) : Indique que 98 % des étudiants se déclarent
stressés par leur quotidien et leur réussite.\n\n

4. Santé Mentale
Odoxa / Mutualité Française (Septembre 2024) : Étude précisant que 55 % des
18-24 ans ont déjà été affectés par un trouble de santé mentale.\n\n
Santé Publique France (Baromètre 2024/2025) : Rapports sur l'augmentation
des pensées suicidaires et des épisodes dépressifs, touchant particulièrement
les jeunes femmes et les étudiants en milieu urbain.`,
    iframe:
      '<iframe src="https://embed.kumu.io/1830091f2b16762285f2d0a937c672a3" width="899" height="490" frameborder="0"></iframe>', // Ou l'URL de ton graphique
  },
  "nouveaux-horizons": {
    title: "L'ÉVEIL",
    text: "\"Le futur n'est pas écrit. Il est dans chaque pas, chaque refus, chaque main tendue. On ne répare pas le monde tout seul, on le réinvente ensemble.\"\n\n L’horizon n’est plus suspendu. Il est simplement à redessiner.\n\n Nous avons exploré le vertige, ressenti le poids des chiffres et navigué dans le brouillard de l'incertitude.\n\n Mais au bout de ce voyage, une certitude demeure : l'impuissance est une illusion entretenue par l'isolement.\n\n L'éco-anxiété n'est pas une maladie à guérir, c'est le signal d'alarme d'une humanité qui refuse de s'éteindre.\n\n En reposant nos écrans, en retrouvant le contact de la terre et le regard de l'autre, la paralysie s'efface.\n\n L'action collective devient l'antidote au désespoir. Nous ne sommes plus les spectateurs d'une fin du monde, mais les architectes d'un monde qui commence.\n\n Un monde plus lent, plus juste, plus vivant. L'horizon ne nous attend pas, il nous appelle.\n\n Il est temps de sortir de la suspension.",
    image: "/images/noeuds/horizon.jpg",
    voiceover: "/audio/vo/horizon-voiceover.mp3",
    bgMusic: "/audio/vo/horizon-background.mp3",
  },
  "message-de-fin": {
    title: "MERCI !",
    text: "Merci d'avoir exploré ce voyage avec nous. L'histoire continue avec vous.",
  },
};
