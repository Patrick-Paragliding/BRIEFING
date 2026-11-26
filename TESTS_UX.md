# Scénarios de Test & Vérifications UX — Projet BRIEFING

Ce document définit les cas de test fonctionnels, cartographiques et ergonomiques (J-1 sur grand écran / Jour J sur mobile) pour valider le comportement de **BRIEFING** conformément à `SPEC_2.md` (`SPEC.md`) et `PROMPT_MAITRE.md`.

> **Rappel cadre :** `BRIEFING` est un outil d'aide à la préparation, à la visualisation et à la structuration de la revue d'instrument. Il ne remplace jamais les sources officielles (SOFIA-Briefing, SIA/eAIP/SUPAIP/NOTAM/AZBA, ZSM, accords locaux FFVL) ni le jugement du pilote.

---

## 1. Écran 1 — Import Multi-Fichiers SOFIA-Briefing & Traçabilité

### TC-1.1 : Chargement exhaustif de $N$ fichiers SOFIA-Briefing
* **Contexte / Données :** charger simultanément ou successivement 2 à 3 dossiers PDF depuis `samples/sofia_pdf/` (ex. deux tronçons de route, ou un dossier de la veille et un dossier du jour).
* **Étapes :**
  1. Importer plusieurs fichiers PDF SOFIA-Briefing dans l'Écran 1.
  2. Charger un fichier supplémentaire en cours de session.
* **Résultat attendu :**
  * Tous les fichiers chargés sont traités de bout en bout sans qu'aucun ne soit ignoré, tronqué silencieusement ou écrasé par le chargement suivant.
  * Les métadonnées et éléments extraits indiquent clairement la source (nom de fichier, repère temporel/validité et périmètre/route si disponible) afin de distinguer les écarts temporels ou de validité.

### TC-1.2 : Résolution CSV des codes aérodromes (`LFXX`) & filtres par défaut
* **Contexte / Données :** un PDF SOFIA-Briefing contenant des codes `LFXX` et une table de référence dans `samples/aerodromes/`.
* **Étapes :**
  1. Ouvrir l'Écran 1 après import du PDF et chargement du CSV.
  2. Observer l'état initial des boutons bascules (toggles) de filtrage des paragraphes.
* **Résultat attendu :**
  * Les codes `LFXX` sont résolus vers leur nom complet et leurs coordonnées GPS.
  * Par défaut, seuls **Aérodrome** et **Restriction En-Route** sont sélectionnés/actifs.

### TC-1.3 : Règles de déduplication SUPAIP / NOTAM (3 cas + inter-fichiers)
* **Contexte / Données :** jeux d'essai `samples/sofia_pdf/` incluant :
  * un SUPAIP sans NOTAM Trigger ;
  * un SUPAIP avec NOTAM Trigger ;
  * un NOTAM isolé ;
  * un doublon ou chevauchement entre deux fichiers SOFIA-Briefing.
* **Étapes :**
  1. Charger le jeu de test couvrant les 3 cas métier.
  2. Charger ensuite deux fichiers couvrant des zones proches ou contiguës.
* **Résultat attendu :**
  * **SUPAIP sans NOTAM Trigger** : le SUPAIP est affiché.
  * **SUPAIP avec NOTAM Trigger** : seul le NOTAM est affiché (sans doublon), tout en conservant le lien vers le SUPAIP.
  * **NOTAM isolé** : le NOTAM est affiché.
  * Sur les doublons inter-fichiers : les éléments sont dédupliqués ou regroupés proprement avec mention des fichiers sources concernés, sans noyer la lecture.

---

## 2. Écran 1 — Cartographie, Contours OpenAir SUPAIP, Partage & Archivage

### TC-2.1 : Code couleur `W` / `R`, curseur de rayon et contours OpenAir SUPAIP connus
* **Contexte / Données :** un dossier SOFIA-Briefing avec zones `W` et `R`, cercles ponctuels et un SUPAIP disposant d'un fichier OpenAir détaillé dans `samples/Openair_SUPAIP/`.
* **Étapes :**
  1. Vérifier le rendu des cartes texte et des polygones pour les types **Warning (`W`)** et **Zone Restreinte (`R`)**.
  2. Manipuler le curseur de rayon dynamique (vérifier la plage démarrant à `5` et la valeur par défaut à `10`).
  3. Observer l'affichage du SUPAIP connu (contour détaillé vs cercle générique SOFIA) et actionner le bouton/interrupteur permettant de masquer le cercle générique associé.
  4. Cliquer sur le contour SUPAIP connu puis sur un contour/cercle générique SOFIA.
* **Résultat attendu :**
  * Distinction visuelle nette et cohérente entre `W` et `R` sur le texte et la carte.
  * Le curseur démarre à `5` (NM/km selon unité configurée) avec une valeur par défaut à `10` et met à jour les cercles concernés.
  * Le contour réel issu de `samples/Openair_SUPAIP/` s'affiche et l'interrupteur permet de masquer le cercle générique SOFIA associé.
  * Un clic affiche la description complète aussi bien sur le contour SUPAIP connu que sur le contour générique SOFIA.

### TC-2.2 : Résumé WhatsApp et archivage local `PXA-BRIEFING-YYYYMMDD-NN.pdf`
* **Contexte / Données :** dossier SOFIA-Briefing chargé sur poste (J-1).
* **Étapes :**
  1. Générer le résumé WhatsApp et cliquer sur le bouton **Copier en 1 clic**.
  2. Lancer la sauvegarde locale du PDF renommé.
* **Résultat attendu :**
  * Le texte copié contient les informations synthétiques attendues (horaires, plafonds, zones actives, lien direct vers le SUPAIP officiel en ligne).
  * Le fichier est proposé/enregistré selon la convention `PXA-BRIEFING-YYYYMMDD-NN.pdf` avec incrément automatique.

---

## 3. Écran 2 — Revue de Configuration Instrument, Visualisation OpenAir & Garde-Fous

### TC-3.1 : Visualisation basée sur les fichiers OpenAir et plafond du SOFIA-Briefing
* **Contexte / Données :** fichiers `samples/Openair_eAIP/`, `samples/Openair_SUPAIP/`, éventuel `samples/Openair_Adhoc/` et un dossier SOFIA-Briefing avec plafond défini (ex. 2 000 m) et route départ -> arrivée.
* **Étapes :**
  1. Ouvrir l'Écran 2.
  2. Tester les filtres de visualisation (couches/sources dont `eAIP` / `Openair_eAIP`, `SUPAIP`, `NOTAM` / `Openair_Adhoc`, repères `ZSM` / `accords locaux FFVL`), le repère de date/validité et le repère d'altitude rapporté au plafond du SOFIA-Briefing.
  3. Vérifier l'ordre des instructions générées.
* **Résultat attendu :**
  * La visualisation s'appuie sur les fichiers OpenAir et les paramètres/plafond extraits du SOFIA-Briefing (le plafond de référence provient du dossier SOFIA-Briefing).
  * Le repère de date/validité indique la fraîcheur/cohérence temporelle sans prétendre calculer l'activation des zones.
  * Les consignes sont triées **du point de départ jusqu'à l'arrivée** (avec distance et relèvement depuis le décollage, gestion de la LTA selon le plafond prévu, activité des zones, consignes radio / vigilance vol sans radio).

### TC-3.2 : Garde-fou AZBA (aucun calcul automatique d'activation)
* **Contexte / Données :** un parcours ou jeu de zones intersectant une zone AZBA.
* **Étapes :**
  1. Charger le parcours intersectant une AZBA dans l'Écran 2.
  2. Changer la date ou les filtres d'affichage.
* **Résultat attendu :**
  * `BRIEFING` ne simule, ne déduit ni ne fige jamais localement un état « active » ou « inactive » pour la zone AZBA.
  * Une alerte systématique signale la présence de l'AZBA et invite impérativement à vérifier l'activité réelle du jour sur le portail / site web dédié AZBA avant de régler ou valider l'instrument.

### TC-3.3 : Synchronisation texte / carte et NOTAM ponctuel (`Openair_Adhoc`)
* **Contexte / Données :** plusieurs instructions listées sur l'Écran 2 et un NOTAM récent créé via l'écran de saisie guidée au format OpenAir (`samples/Openair_Adhoc/`).
* **Étapes :**
  1. Créer un NOTAM de dernière minute via l'écran de saisie guidée pour générer un fichier OpenAir ponctuel, puis l'intégrer à la revue.
  2. Survoler ou cliquer sur une instruction dans la liste.
* **Résultat attendu :**
  * Le NOTAM ponctuel conforme au format OpenAir est pris en compte dans la revue sans alourdir le parcours principal.
  * Le survol ou clic sur une instruction met en surbrillance la zone correspondante sur la carte et centre la vue dessus.

---

## 4. Ergonomie Multi-Supports (J-1 PC / Jour J Mobile) & Architecture Client-Side

### TC-4.1 : Parcours J-1 (PC) vs Jour J (Smartphone) sans serveur
* **Contexte / Données :** application ouverte localement dans un navigateur (sans backend), testée en largeur desktop et en vue mobile/tactile.
* **Étapes :**
  1. Vérifier le fonctionnement hors serveur / sans backend.
  2. Tester l'accès aux filtres, alertes, synchronisation texte/carte et instructions d'instrument sur format mobile.
* **Résultat attendu :**
  * L'application fonctionne en 100 % client-side et réutilise le socle commun (**Logo**, `Core.js`, `Theme.css`, `STANDARD_UI`).
  * Sur mobile (Jour J), les contrôles tactiles, alertes (AZBA, ZSM, accords locaux FFVL, vol sans radio) et la bascule/lecture des instructions restent lisibles et accessibles.