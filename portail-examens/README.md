# Examens ZESE – Espace enseignants

Portail d'information pour les enseignants convoqués aux examens de la Zone Europe du Sud-Est.
Projet indépendant de l'application Omael : site statique (HTML/CSS/JS), sans étape de build.

## Pages

Site d'information commun à tous les enseignants (pas d'espace personnel).

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : rubriques, 3 règles à retenir, parcours, qui contacter |
| `convocation.html` | Convocation par mail professionnel, caractère obligatoire, procédure d'absence (certificat médical) |
| `deplacement.html` | Grand oral et oral de français : trajet proposé par l'établissement d'accueil, nuitées, per diem, textes, bordereaux |
| `indemnites.html` | Frais de mission, état de frais (signature du chef d'établissement d'accueil, circuit des exemplaires), paiement MAJ / recrutés locaux |
| `second-groupe.html` | Oraux en visio depuis l'établissement d'origine, banque des sujets en ligne |
| `ressources.html` | Plateformes, formulaires, guides, textes officiels, calendrier |
| `faq.html` | Questions fréquentes avec recherche |
| `mentions-legales.html`, `accessibilite.html`, `404.html` | Pages annexes |

L'en-tête et le pied de page sont générés par `assets/app.js` (menu à modifier en un seul endroit : tableau `NAV`).
Les icônes sont dans `assets/icons.svg`, les styles dans `assets/style.css`.

## À compléter avant publication

- Les liens `href="#a-venir"` (documents PDF, plateformes, espace DEC) : déposer les fichiers dans un dossier `docs/` et remplacer les liens. Tant qu'un lien vaut `#a-venir`, un message « document mis en ligne prochainement » s'affiche.
- `ressources.html` : nom et liens des plateformes (Imag'in, banque des sujets) à confirmer.
- `indemnites.html` : vérifier le circuit de paiement (MAJ pour les détachés).
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
