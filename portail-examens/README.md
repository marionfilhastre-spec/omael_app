# Examens ZESE – Espace enseignants

Portail d'information pour les enseignants convoqués aux examens de la Zone Europe du Sud-Est.
Projet indépendant de l'application Omael : site statique (HTML/CSS/JS), sans étape de build.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : rubriques, alerte déplacement, étapes, accès rapides |
| `mission.html` | Convocation, établissement d'accueil, déroulement de la journée |
| `deplacement.html` | Procédure de déplacement, hébergement, imprévus |
| `indemnites.html` | Indemnités, montants indicatifs, justificatifs, remboursement |
| `ressources.html` | Plateformes, grilles, guides, textes officiels |
| `faq.html` | Questions fréquentes avec recherche |
| `mentions-legales.html`, `accessibilite.html`, `404.html` | Pages annexes |

L'en-tête et le pied de page sont générés par `assets/app.js` (menu à modifier en un seul endroit : tableau `NAV`).
Les icônes sont dans `assets/icons.svg`, les styles dans `assets/style.css`.

## À compléter avant publication

- Les liens `href="#a-venir"` (documents PDF, plateformes, espace DEC) : déposer les fichiers dans un dossier `docs/` et remplacer les liens. Tant qu'un lien vaut `#a-venir`, un message « document mis en ligne prochainement » s'affiche.
- `mission.html` : les données (Lycée français de Sofia, dates, discipline) sont un exemple.
- `indemnites.html` : vérifier les montants indicatifs.
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
