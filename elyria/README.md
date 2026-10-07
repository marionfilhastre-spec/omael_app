# ELYRIA — Prototype 0.1 · Lac des Deux Lunes

Maquette navigateur jouable (environ 12 minutes) construite à partir de la **Bible créative & visuelle v0.2**, du **Dossier complet du projet v0.1** et du pack `ELYRIA_Claude`.

La bible est la source de vérité créative. Tous les décors, personnages et objets affichés sont **découpés dans les planches de la bible** : rien n'a été redessiné ni réinventé. Le code ajoute uniquement ce que les planches décrivent en mouvement (lumière, eau, particules, transition présent → Écho).

## Lancer

Ouvrir `elyria/index.html` dans un navigateur. Pour avoir le rendu complet (ondulations de l'eau, transition dorée de l'Écho), servir le dossier en local :

```
cd elyria
python3 -m http.server 8000
# puis http://localhost:8000
```

En `file://`, le navigateur bloque WebGL sur les images locales : le jeu bascule alors sur un rendu 2D simplifié.

## Commandes

| Action | Clavier / souris | Tactile |
|---|---|---|
| Regarder | ← → (ou A / D), glisser | glisser |
| Interagir / avancer | E, Espace, Entrée, clic | toucher |
| Point d'intérêt suivant | Tab | — |
| Résonance (révèle les traces) | R | double toucher |
| Maintenir pour résonner (photo) | maintenir E | maintenir le doigt |
| Carnet | C | menu ‖ → Carnet |
| Pause / options | Échap | bouton ‖ |
| Faits du WorldState (debug) | F | menu ‖ → Faits du monde |

## Le parcours (section 03 du dossier)

| Temps | Moment | Plan utilisé (bible) |
|---|---|---|
| 0:00 | Écran noir, eau, respiration. « Tu m'entends ? Ouvre les yeux. » Le joueur ouvre les yeux. | — |
| 0:30 | Caméra au ras de l'eau, les deux lunes, la créature céleste traverse le ciel. Pas d'interface. | Lac des Deux Lunes, vue principale |
| 1:00 | La marque lumineuse dans la paume, puis elle s'efface. | Protagoniste, « Contact avec le monde » |
| 1:15 | Déplacement libre sur la rive : arche en ruine, Arbre-Monde, eau, ponton, fleurs. Silhouette au loin sur les rochers. | Lac des Deux Lunes + détails environnementaux |
| 3:00 | Elya : « Tu es revenu. » Hub de questions, « Pas encore. » | Elya, portrait et expressions |
| 5:30 | La caméra descend : Elya a deux ombres, lui aucune. Le Carnet : « Je n'ai pas d'ombre. » | Le Monde d'Elyria, vue globale |
| 6:00 | Elya montre la maison. Choix : « Viens avec moi. » / « J'irai seul. » Lucioles de mémoire. | Le Monde d'Elyria |
| 7:30 | La maison abandonnée, cinq objets, la photographie sur le manteau de la cheminée. | Transition vers l'Écho (Présent), La Maison (Intérieur Présent, Objets narratifs) |
| 10:00 | La photo, retournée : « Pour quand tu auras oublié. » Maintenir pour résonner. | Planche maître, « Plan détail — la photo du souvenir » |
| 10:45 | Écho : flash doré, la pièce redevient habitée. Trois fragments, silhouettes lumineuses. « Tu reviendras demain ? » Il promet. | La Maison, Intérieur Écho |
| 13:00 | Le souvenir se fissure. Retour dans la maison froide. Elya : « Tu es resté longtemps à l'intérieur. » Vérité, mensonge ou question. | Intérieur Présent + portrait d'Elya |
| 14:30 | Dernier plan sur la maison, carton de fin : « Une Promesse » et trois questions ouvertes. | Transition vers l'Écho |

## Ce qui vient directement de la bible

- **Grammaire de couleur** : présent en lavande, bleu argenté, violet profond, rose-pêche ; Écho en or et ambre. L'or n'apparaît dans l'interface que pour ce qui touche à la mémoire.
- **Transition vers l'Écho en 5 étapes** (planche « Un même lieu, deux réalités ») : présent calme, premiers indices (particules), superposition, transformation, Écho révélé.
- **Interface de la planche** : bandes cinéma, choix en bas à gauche dans des cartouches à bord doré, Carnet de souvenirs en parchemin avec onglets Souvenirs / Questions.
- **Répliques canoniques** : « Tu es revenu. », « Pas encore. », « Je n'ai pas d'ombre. », « Pour quand tu auras oublié. », « Tu es resté longtemps à l'intérieur. » (planche Elya), « Les lieux se souviennent. Il suffit d'écouter. » (planche Transition), « « Tu reviendras demain ? » J'ai promis. Je ne sais pas à qui. » et les trois questions du Carnet (dossier).
- **Interdits respectés** : pas de low-poly, pas de cartoon, pas de rendu froidement photoréaliste.

## Systèmes (dossier, sections 05 à 10)

- **WorldState** (`js/worldstate.js`) : un fait = une clé hiérarchique (`Fact.*`, `Rel.*`, `Elya.*`) et un entier. Conditions `Clé op Valeur AND …`, effets `Set` / `Add`, journal avec la source de chaque modification.
- **Conséquences différées** (`ELY.RULES` dans `js/data.js`) : `Elya_SeSouvientDuSilence` (si le joueur s'est tu à la première rencontre, un choix « [Ne rien dire] » apparaît au retour de l'Écho) et `Elya_AttendSeule` (si le joueur est parti seul, Elya est quand même venue).
- **Relations** : cinq axes vus depuis Elya (Confiance, Affection, Respect, Peur, Dépendance) + `Elya.Suspicion`, combinés en un état nommé `Elya.Bond` (Warm, Guarded, Distant) qui choisit sa dernière réplique.
- **Feuille dorée** (proposition B du dossier) : une feuille tombe dans un coin quand un choix est retenu, sans dire lequel. Désactivable dans les options.
- **Sauvegarde par checkpoint** (jamais dans un Écho) : réveil, rencontre, maison, après l'Écho.
- **Accessibilité** : taille des sous-titres, réduction des flashs et particules, appui simple au lieu de maintenir.

Toutes les données (plans, points d'intérêt, dialogues, règles, Carnet) sont dans `js/data.js`.

## Répliques à remplacer

Les répliques marquées `ph: true` dans `js/data.js` (et `{ ph: true }` dans `js/game.js`) sont des placeholders, comme les répliques † du dossier. Elles font tourner le parcours : remplace-les par les tiennes. Il s'agit des pensées sur les objets de la rive et de la maison, des réponses d'Elya aux questions, des trois fragments de l'Écho et des réactions d'Elya au retour.

## Points à trancher

1. **Cheveux d'Elya** : le texte de la bible et du lore dit « cheveux argentés », mais toutes les images de la bible v0.2 montrent des cheveux miel / blond doré. Le prototype suit les images.
2. **Fille ou garçon dans l'Écho** : le lore dit « une petite fille ». Le prototype écrit « Une enfant » et montre des silhouettes lumineuses sans visage, pour ne pas trancher à ta place.
3. **Visage du protagoniste** : il reste toujours de dos ou hors champ, et la photographie est floue (proposition B du dossier).

## Images en haute définition

Les décors ont été découpés dans des captures d'écran de la bible, donc en basse résolution, puis agrandis. Pour un rendu net, dépose les images originales de chaque planche dans `assets/img/` **sous les mêmes noms** (le code n'a pas besoin de changer) :

| Fichier | Image de la bible |
|---|---|
| `lac_panorama.jpg` | Le Lac des Deux Lunes, vue principale (sans le titre incrusté) |
| `monde_vue_globale.jpg` | Le Monde d'Elyria, vue globale |
| `maison_ext_present.jpg` / `maison_ext_echo.jpg` | Transition vers l'Écho : Présent / Écho (mémoire) |
| `maison_int_present.jpg` / `maison_int_echo.jpg` | La Maison : Intérieur Présent / Intérieur Écho |
| `elya_portrait.jpg` + `elya_*.jpg` | Elya : grand portrait et six expressions |
| `photo_recto.jpg` | Planche maître : plan détail, la photo du souvenir |
| `lac_*.jpg`, `objet_*.jpg` | Détails environnementaux et objets narratifs |
| `proto_main.jpg` | Le Protagoniste : contact avec le monde |
