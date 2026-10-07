/* ELYRIA — Prototype 0.1 · données
   Tout le contenu du parcours vit ici : plans, points d'intérêt, dialogues, règles.
   Les répliques marquées ph:true sont des placeholders (marqués † dans le dossier) :
   elles font tourner le parcours et doivent être remplacées par les tiennes.
   Les répliques sans ph viennent de la bible, du lore ou du dossier de production. */
window.ELY = window.ELY || {};

ELY.IMG = {
  monde: 'assets/img/monde_vue_globale.jpg',
  rive: 'assets/img/lac_panorama.jpg',
  maisonExt: 'assets/img/maison_ext_present.jpg',
  maisonExtEcho: 'assets/img/maison_ext_echo.jpg',
  interieur: 'assets/img/maison_int_present.jpg',
  interieurEcho: 'assets/img/maison_int_echo.jpg',
  main: 'assets/img/proto_main.jpg',
  elyaPortrait: 'assets/img/elya_portrait.jpg'
};

/* Visages d'Elya : planche « Elya — expressions ». */
ELY.ELYA_FACES = {
  calme: 'assets/img/elya_portrait.jpg',
  douceur: 'assets/img/elya_douceur.jpg',
  inquietude: 'assets/img/elya_inquietude.jpg',
  sourire: 'assets/img/elya_sourire.jpg',
  tristesse: 'assets/img/elya_tristesse.jpg',
  determination: 'assets/img/elya_determination.jpg',
  emerveillement: 'assets/img/elya_emerveillement.jpg'
};

/* Plans. Coordonnées normalisées dans l'image (0..1).
   water : bande d'eau [haut, bas] où la surface ondule (« l'eau raconte la lumière »). */
ELY.SHOTS = {
  rive: { img: 'rive', water: [0.64, 0.9], cx: 0.32, cy: 0.5, zoom: 1, pan: true },
  monde: { img: 'monde', water: [0.52, 0.86], cx: 0.55, cy: 0.5, zoom: 1, pan: true },
  maisonExt: { img: 'maisonExt', imgB: 'maisonExtEcho', water: [0.6, 0.92], cx: 0.55, cy: 0.5, zoom: 1, pan: true },
  interieur: { img: 'interieur', imgB: 'interieurEcho', cx: 0.55, cy: 0.5, zoom: 1, pan: true },
  main: { img: 'main', cx: 0.5, cy: 0.5, zoom: 1.05 },
  ombres: { img: 'monde', water: [0.52, 0.86], cx: 0.22, cy: 0.8, zoom: 2.1 }
};

/* Points d'intérêt de la rive : « petites découvertes sans enjeu ». */
ELY.RIVE_SPOTS = [
  { id: 'arche', x: 0.055, y: 0.42, verb: 'Examiner', name: 'Arche en ruine', img: 'assets/img/lac_ruines.jpg',
    text: 'Des pierres plus vieilles que tout ce dont je me souviens. Ce qui n\'est pas grand-chose.', ph: true },
  { id: 'arbre', x: 0.42, y: 0.30, verb: 'Regarder', name: 'L\'Arbre-Monde', img: 'assets/img/lac_arbre_monde.jpg',
    text: 'Si loin, et pourtant on ne voit que lui.', ph: true },
  { id: 'eau', x: 0.36, y: 0.80, verb: 'Toucher', name: 'L\'eau', img: 'assets/img/lac_eau.jpg',
    text: 'Froide. Elle bouge sous mes doigts. Je suis bien là.', ph: true },
  { id: 'ponton', x: 0.61, y: 0.76, verb: 'Examiner', name: 'Ponton', img: 'assets/img/lac_ponton.jpg',
    text: 'Une barque amarrée. Quelqu\'un comptait revenir.', ph: true },
  { id: 'fleurs', x: 0.52, y: 0.93, verb: 'Examiner', name: 'Fleurs', img: 'assets/img/lac_vegetation.jpg',
    text: 'Elles s\'ouvrent la nuit. Elles se tournent vers les lunes.', ph: true }
];
/* Silhouette d'Elya sur les rochers : premier repère, sans marqueur. */
ELY.ELYA_FAR = { x: 0.272, y: 0.66 };

/* Objets de la maison : « quatre ou cinq objets racontent une vie de famille ». */
ELY.MAISON_SPOTS = [
  { id: 'tasses', x: 0.63, y: 0.60, verb: 'Examiner', name: 'Deux tasses', img: 'assets/img/objet_tasses.jpg',
    text: 'Deux tasses, côte à côte. Comme si quelqu\'un allait revenir les remplir.', ph: true },
  { id: 'dessin', x: 0.11, y: 0.80, verb: 'Examiner', name: 'Un dessin', img: 'assets/img/objet_carnet_arbre.jpg',
    text: 'Un arbre, dessiné à la main. Ses branches débordent de la page.', ph: true },
  { id: 'pendentif', x: 0.40, y: 0.64, verb: 'Examiner', name: 'Pendentif', img: 'assets/img/objet_pendentif.jpg',
    text: 'Le même arbre, gravé dans le métal. Il est encore tiède.', ph: true },
  { id: 'livres', x: 0.885, y: 0.74, verb: 'Examiner', name: 'Livres de contes', img: 'assets/img/objet_livre.jpg',
    text: 'Des contes. Les coins sont usés, toujours à la même page.', ph: true },
  { id: 'vase', x: 0.07, y: 0.50, verb: 'Examiner', name: 'Fleurs séchées', img: 'assets/img/objet_vase.jpg',
    text: 'Les fleurs violettes de la rive. Quelqu\'un les a cueillies, il y a longtemps.', ph: true }
];
ELY.PHOTO_SPOT = { id: 'photo', x: 0.88, y: 0.29, verb: 'Examiner', name: 'Photographie', memory: true };

/* Écho 001 : trois fragments dans la pièce (image Écho de la maison). */
ELY.FRAGMENTS = [
  { id: 'f1', x: 0.66, y: 0.42, who: 'Une femme', line: 'Tu pars à l\'aube ?', ph: true },
  { id: 'f2', x: 0.30, y: 0.68, who: 'Une enfant', line: 'Tu me racontes encore l\'arbre ?', ph: true },
  { id: 'f3', x: 0.86, y: 0.60, who: 'Une femme', line: 'Deux tasses. Comme toujours.', ph: true }
];
/* Silhouettes lumineuses de l'Écho (MetaHumans « silhouette lumineuse » dans le dossier). */
ELY.ECHO_FIGURES = { woman: { x: 0.52, y: 0.84, h: 0.46 }, child: { x: 0.43, y: 0.82, h: 0.28 } };

/* Dialogue : hub de la première rencontre (DA_Elya_FirstMeeting). */
ELY.DLG_FIRST = {
  start: 'E1_Revenu',
  nodes: {
    E1_Revenu: { lines: [{ s: 'Elya', t: 'Tu es revenu.', face: 'douceur' }], hub: true },
    E2_PasEncore: { lines: [{ s: 'Elya', t: 'Pas encore.', face: 'tristesse' }], back: true },
    E3_Nom: { lines: [
      { s: 'Elya', t: 'Elya. Je veille sur ce lac.', face: 'calme', ph: true },
      { s: 'Elya', t: 'Sur ceux qui arrivent. Et sur ceux qui reviennent.', face: 'douceur', ph: true }], back: true },
    E4_Lieu: { lines: [
      { s: 'Elya', t: 'Au bord du Lac des Deux Lunes.', face: 'calme', ph: true },
      { s: 'Elya', t: 'Tout ce qui arrive en Elyria finit par passer ici.', face: 'emerveillement', ph: true }], back: true },
    E5_Silence: { lines: [{ s: 'Elya', t: 'Tu as raison. Écoute d\'abord.', face: 'sourire', ph: true }], back: true },
    E6_Partir: { lines: [{ s: 'Elya', t: 'Viens. Il y a quelque chose que tu dois voir.', face: 'determination', ph: true }], end: true }
  },
  hub: [
    { t: 'On se connaît ?', type: 'question', next: 'E2_PasEncore', fx: [['Set', 'Fact.Dlg.Elya.AskedIfKnown', 1]], asked: 'Fact.Dlg.Elya.AskedIfKnown' },
    { t: 'Qui es-tu ?', type: 'question', next: 'E3_Nom', fx: [['Set', 'Fact.Dlg.Elya.AskedName', 1]], asked: 'Fact.Dlg.Elya.AskedName' },
    { t: 'Où suis-je ?', type: 'question', next: 'E4_Lieu', fx: [['Set', 'Fact.Dlg.Elya.AskedPlace', 1]], asked: 'Fact.Dlg.Elya.AskedPlace' },
    { t: '[Ne rien dire]', type: 'silence', next: 'E5_Silence', fx: [['Set', 'Fact.Dlg.Elya.Silence', 1], ['Add', 'Rel.Elya.Affection', 1]],
      cond: 'Fact.Dlg.Elya.Silence == 0', retained: true },
    { t: 'Partir', type: 'exit', next: 'E6_Partir', cond: 'Fact.Dlg.Elya.HubVisits >= 1' }
  ]
};

/* Retour de l'Écho : Elya sait qu'il a vu quelque chose. */
ELY.DLG_RETOUR = [
  { t: 'J\'ai vu une femme. Et une enfant.', type: 'position', id: 'verite',
    fx: [['Set', 'Fact.Elya.ToldTruth', 1], ['Add', 'Rel.Elya.Confiance', 1], ['Add', 'Rel.Elya.Peur', 1]],
    reply: [
      { s: 'Elya', t: '…', face: 'inquietude' },
      { s: 'Elya', t: 'Alors la maison se souvient encore de toi.', face: 'tristesse', ph: true }] },
  { t: 'Il n\'y avait rien.', type: 'position', id: 'mensonge',
    fx: [['Set', 'Fact.Elya.LiedAboutEcho', 1], ['Add', 'Elya.Suspicion', 1]],
    reply: [
      { s: 'Elya', t: 'Bien sûr.', face: 'determination', ph: true },
      { s: 'Elya', t: 'Il n\'y a jamais rien, au début.', face: 'tristesse', ph: true }] },
  { t: 'Qu\'est-ce que cette maison ?', type: 'question', id: 'question',
    fx: [['Set', 'Fact.Elya.Questioned', 1], ['Add', 'Rel.Elya.Respect', 1], ['Add', 'Rel.Elya.Peur', 1]],
    reply: [
      { s: 'Elya', t: 'Une maison qui attend quelqu\'un.', face: 'inquietude', ph: true },
      { s: 'Elya', t: 'Depuis très longtemps.', face: 'tristesse', ph: true }] },
  /* Choix débloqué par une conséquence différée (règle Elya_SeSouvientDuSilence). */
  { t: '[Ne rien dire]', type: 'silence', id: 'silence', cond: 'Fact.Elya.Topic.Silence == 1',
    fx: [['Add', 'Rel.Elya.Affection', 1]],
    reply: [{ s: 'Elya', t: 'Comme tout à l\'heure. D\'accord. Je ne te demanderai rien.', face: 'douceur', ph: true }] }
];

/* Conséquences différées : « quand l'événement X se produit, si Y, appliquer Z ». */
ELY.RULES = [
  { id: 'Elya_SeSouvientDuSilence', trigger: 'Event.Dialogue.Start.Elya.Retour',
    cond: 'Fact.Dlg.Elya.Silence == 1', fx: [['Set', 'Fact.Elya.Topic.Silence', 1]], once: true },
  { id: 'Elya_AttendSeule', trigger: 'Event.Echo.001.Exit',
    cond: 'Fact.Elya.Accompanied == 0', fx: [['Set', 'Fact.Elya.CameAnyway', 1]], once: true }
];

/* Carnet : souvenirs et questions (écrits à la première personne). */
ELY.CARNET = {
  souvenirs: {
    lac: { title: 'Lac des Deux Lunes', img: 'assets/img/lac_ciel_lunes.jpg',
      text: 'Je me suis réveillé au bord de l\'eau. Deux lunes. Une voix qui me connaissait.' , ph: true },
    ombre: { title: 'Sans ombre', img: 'assets/img/proto_bottes.jpg', hand: 'Je n\'ai pas d\'ombre.' },
    maison: { title: 'La Maison', img: 'assets/img/maison_ext_present.jpg',
      text: 'Une maison sur l\'autre rive. Quelqu\'un y a vécu. Peut-être moi.', ph: true },
    promesse: { title: 'Une Promesse', img: 'assets/img/maison_int_echo.jpg',
      hand: '« Tu reviendras demain ? » J\'ai promis. Je ne sais pas à qui.',
      text: 'Un instant simple, mais qui semble porter un poids immense. Pourquoi ce souvenir me touche-t-il autant ?' }
  },
  order: ['lac', 'ombre', 'maison', 'promesse'],
  questions: {
    ombre: 'Pourquoi n\'ai-je pas d\'ombre ?',
    pasEncore: 'Elle dit que je suis revenu. Mais elle dit aussi que nous ne nous connaissons « pas encore ».',
    revenu: 'Elle dit que je suis revenu. Revenu d\'où ?',
    promesse: 'Qui sont la femme et l\'enfant ? Ai-je tenu ma promesse ?'
  }
};
