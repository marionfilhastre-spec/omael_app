# Examens ZESE – Espace enseignants

Portail d'information pour les enseignants convoqués aux examens de la Zone Europe du Sud-Est.
Projet indépendant de l'application Omael : site statique (HTML/CSS/JS), sans étape de build.

## Pages

Site d'information commun à tous les enseignants (pas d'espace personnel).

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : l’essentiel (absence, convocation, état de frais), choix de la mission, « être payé(e) » en 3 étapes |
| `convocation.html` | Convocation par mail professionnel, caractère obligatoire, procédure d’absence (certificat médical) |
| `correction.html` | Correcteurs du baccalauréat : SANTORIN, réunions, état de frais F1 |
| `dnb.html` | Brevet : calendrier par pays, correction sur VIATIQUE, état de frais F1 DNB, barème |
| `oral-francais.html` | Oral de français : Drive des œuvres et textes, déroulement, état de frais F2 |
| `grand-oral.html` | Grand oral : rôle de l’examinateur non spécialiste, déroulement, état de frais F2 |
| `second-groupe.html` | Second groupe en visio, sujets en ligne, état de frais F2 |
| `deplacement.html` | Déplacement et frais de mission : ordre de mission, transport, nuitées, per diem |
| `ije.html` | État de frais et IJE : F1/F2, signataires, paiement selon le statut, barèmes, documents |
| `ressources.html`, `faq.html`, `contact.html` | Documents, questions fréquentes, contact |
| `mentions-legales.html`, `accessibilite.html`, `404.html` | Pages annexes |

L'en-tête et le pied de page sont générés par `assets/app.js` (menu à modifier en un seul endroit : tableau `NAV`).
Les icônes sont dans `assets/icons.svg`, les styles dans `assets/style.css`.

## À compléter avant publication

- Les liens `href="#a-venir"` (documents PDF, plateformes, espace DEC) : déposer les fichiers dans un dossier `docs/` et remplacer les liens. Tant qu'un lien vaut `#a-venir`, un message « document mis en ligne prochainement » s'affiche.
- `ressources.html` : nom et liens des plateformes (Imag'in, banque des sujets) à confirmer.
- `ije.html` : contenu issu de la note AEFE « Organisation des examens – session 2026 » et des modèles F1/F2 ; barèmes à mettre à jour à chaque session.
- `mentions-legales.html` : nom du directeur de la publication.

## Prévisualiser en local

```
cd portail-examens
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000

## Publier sur Netlify

1. Sur app.netlify.com : **Add new site → Import an existing project → GitHub** et choisir le dépôt `omael_app`.
2. Branche à déployer : celle qui contient le portail (`main` après fusion).
3. **Base directory : `portail-examens`** (important : c'est ce qui sépare le portail de l'application Omael).
4. Build command : laisser vide. Publish directory : `portail-examens` (déjà indiqué par `netlify.toml`).
5. Deploy. Ensuite, *Site configuration → Change site name* pour une adresse du type `examens-zese.netlify.app`.

Alternative sans GitHub : glisser-déposer le dossier `portail-examens` sur https://app.netlify.com/drop.
