### Contexte à rappeler 


### A SUIVRE 27/11/2026

1. Entêtes des NOTAM + signet / accordéon pour le contenu : afficher d'abord une ligne d'entête synthétique par NOTAM, ouvrir le détail à la demande (signet / dépliage), et caler précisément ce qu'on met dans l'entête puis ce qu'on garde dans le contenu.
2. OK Vrais chemins SIA (SUP AIP et AIRAC) : tu me donneras les URLs/chemins officiels exacts du SIA pour les SUP AIP et les AIRAC afin qu'on remplace toute hypothèse d'URL par les vrais liens.
3. Tri des NOTAM affichés : mettre les NOTAM Rouge (R / restriction) en haut de la liste (et affiner les repères visuels).
4. Bouton Sauvegarde + Copier le texte + WhatsApp : ajouter un bouton de sauvegarde locale en plus de la copie presse-papiers et du partage WhatsApp.   
5. Lien SIA dans le résumé + validation du texte avec les utilisateurs : intégrer l'hyperlien vers le document SIA dans le résumé et valider la formulation finale avec les pilotes.
6. Documentation MD
Curseur de rayon maximal : SPEC.md et TESTS_UX.md mentionnent une plage démarrant à 5 avec défaut à 10, alors que l'Écran 1 actuel fixe le plancher minimal à 2 NM (avec valeur par défaut à 50 NM et curseur jusqu'à 200 NM).   État d'avancement réel : SPEC.md et TESTS_UX.md décrivent encore l'ensemble des fonctionnalités (multi-fichiers PDF, renommage PXA-BRIEFING-YYYYMMDD-NN.pdf, Écran 2 de revue instrument, saisie OpenAir Adhoc, export .txt/.openair) comme un cahier des charges cible, alors que le 1er checkpoint porte sur une première base fonctionnelle centrée sur l'Écran 1 et le rattachement PXA_OPENAIR (bySup / byNotam / geoms).   Structure des fichiers : SPEC.md évoque Core.js / Theme.css / samples/..., tandis que l'Écran 1 actuel embarque son style et s'appuie sur aerodromes-data.js, supaip-openair-data.js, sofia-core.js et sofia-map.js.   
7. Créer la moulinette d'embarquement
8. 2 HTML pour Mobile - PC + Penser au CSS pour mobile
9. le changement de couleur des cercles n'est pas actif
10. Sélecteur d'entêtes en signet : placer l'outil de sélection des rubriques NOTAM dans un onglet/signet dédié (ou panneau latéral repliable) plutôt que dans la carte repliée au-dessus de la liste.
11. 2e écran (Résumé Briefing / modale) : agrandir la fenêtre pour qu'elle occupe l'espace disponible et y intégrer l'aperçu visuel du PDF SOFIA (pdfPreviewCanvas) en plus du résumé texte.
12. Exemple Sans point de contournement ne fonctionne pas
13. Pourquoi le SUPAIP 212/25 apparait (certainement un problème de data sur Fichier EA PXA)
14. OK Revoir supaip.fr le fichier SOFIA Briefing (en fait il fait tourner un rapport sur 5 FIR) > pas de besoin de route ?
15. Verifier Résultat vs https://www.flyscope.fr/



### 2026-11-26 — Organisation de `samples/` (OpenAir) et règle AZBA (Écran 2)
- **Décisions actées :**
  - Les contours SUP AIP connus (`Openair_SUPAIP/`) et la source de référence de l'Écran 2 (`Openair_eAIP/`) sont des fichiers OpenAir (`Openair_eAIP` provenant du processus central de production).
  - La vérification d'activation des zones AZBA s'effectue sur le **site web dédié AZBA** : `BRIEFING` signale la présence d'une AZBA et rappelle de consulter le portail AZBA pour l'état du jour, sans déduction ni simulation locale d'activation.
- **Documents à aligner :** `SPEC.md` et `TESTS_UX.md`.     

**NOTAM de dernière minute (OpenAir assisté) :** ajout de la possibilité pour l'utilisateur de créer un petit fichier OpenAir ponctuel via un écran/formulaire de saisie guidée afin de respecter la syntaxe OpenAir.
Création du dossier `samples/Openair_Adhoc/` avec un exemple de fichier OpenAir ponctuel pour tester la saisie guidée des NOTAM de dernière minute.


## Évolution Mockup HTML BRIEFING (OpenAir Adhoc, Fonds de carte & Export OpenAir)

- **Structure initiale** : mise en place du mockup HTML autonome à 3 volets (filtres/liste, carte et profil vertical `FL × 30` m, fiche détail et rappels vol sans radio).
- **Saisie OpenAir Adhoc** : ajout d'un écran/modale de saisie assistée de NOTAM ponctuels au format OpenAir (`AC`, `AN`, `AL`, `AH`, cercle/polygone) ciblant `samples/Openair_Adhoc/`.
- **Sélection du fond de carte** : ajout d'un sélecteur de fond de carte (`Sombre PXA`, `Carte OACI / VFR`, `IGN / Topographique`, `Relief / Plaine`) dans la barre d'outils cartographique.
- **Format d'export** : correction de l'export du mockup afin de générer un **fichier texte au format OpenAir** (`.txt` / `.openair`) plutôt qu'un fichier JSON.
