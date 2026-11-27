# Spécifications Fonctionnelles & UX — Projet BRIEFING

## 0. Contexte, Périmètre & Avertissement Réglementaire

**BRIEFING** est une application web autonome (100 % client-side : HTML5 / CSS3 / JavaScript Vanilla) destinée aux pilotes de parapente cross-country (XC). Elle permet de vérifier les informations aéronautiques du jour (ou de la veille) avant de mettre à jour l'instrument de vol (ex. XCTrack) avec les contraintes des espaces aériens.

> **Avertissement réglementaire :** `BRIEFING` est un outil d'aide à la préparation, à la visualisation et à la structuration de la revue d'instrument. Il ne remplace en aucun cas le dossier officiel SOFIA-Briefing, les publications officielles du SIA (eAIP, SUPAIP, NOTAM, AZBA), ni le jugement et la responsabilité du pilote en vol.

### Charte & Socle Technique Commun

* Réutilisation du standard visuel et technique existant : **Logo**, **`Core.js`**, **`Theme.css`** et conventions documentées dans **`STANDARD_UI`** (ajustables si nécessaire pour les écrans de `BRIEFING`).

* Architecture sans serveur (zéro backend), ouvrable directement dans un navigateur sur PC et smartphone.

* **Approche non centralisée pour la revue des SUPAIP** : s'articule avec l'approche décentralisée / non centralisée développée dans l'autre application, afin de récupérer/consulter les contours ou informations SUPAIP connus sans dépendre d'un serveur central unique imposé.

* **Adaptation selon le contexte d'usage :**

  * **J-1 (PC / Grand écran)** : analyse détaillée, vue cartographique large, revue des contours SUPAIP connus, génération du résumé WhatsApp et archivage local du PDF.

  * **Jour J (Mobile / Terrain)** : ergonomie mobile-first, boutons tactiles accessibles, lecture rapide des filtres, des alertes et de la checklist de configuration instrument.

## 1. Personas & Parcours Utilisateur

| Persona | Moment d'usage | Support privilégié | Besoins clés | 
| ----- | ----- | ----- | ----- | 
| **Pilote Préparateur (J-1)** | Préparation du parcours et partage au groupe avant le jour du vol | **PC (Grand écran)** | Lire le PDF SOFIA-Briefing (un ou plusieurs dossiers), vérifier les SUPAIP/NOTAM, ajuster les rayons/contours, copier le résumé WhatsApp, archiver le PDF renommé. | 
| **Pilote au Décollage (Jour J)** | Dernières vérifications avant le décollage et mise à jour de l'instrument | **Smartphone (Mobile)** | Vérifier rapidement les contraintes actives/inactives sur le tracé, consulter l'alerte AZBA/ZSM/accords locaux, suivre l'ordre des actions sur l'instrument. | 

## 2. Data Lineage & Chaîne de l'Information Aéronautique (EA)

L'information aéronautique croisée dans `BRIEFING` combine plusieurs sources distinctes avec un niveau d'automatisation et de vigilance adapté à chaque couche :

```
[SOURCES D'INFORMATION]
 ├── eAIP / SIA (Cycle AIRAC) ─────────► Espaces permanents (CTR, TMA, LTA, ZIT/ZP/R/D) dans l'instrument
 ├── SOFIA-Briefing (PDF plan de vol) ──► Paramètres du vol + NOTAM + SUPAIP extraits sur le couloir (1 à N fichiers)
 ├── Revue SUPAIP (Non centralisée) ──► Contours connus des SUPAIP (approche non centralisée partagée avec l'autre appli)
 ├── Portail SIA / AZBA (Jour J) ─────► Réseau Très Basse Altitude (RTBA) — Vérification manuelle obligatoire
 ├── Base ZSM / Biodiv'Sports ────────► Zones de Sensibilité Majeure (enjeux écologiques / saisonniers)
 └── Accords Locaux FFVL ─────────────► Protocoles locaux / règles spécifiques / conditions radio
              │
              ▼
[TRAITEMENT & CROISEMENT DANS BRIEFING]
 ├── Extraction PDF & Filtres ─────────► Traitement exhaustif de tous les fichiers chargés ; par défaut : "Aérodrome" et "Restriction En Route" sélectionnés
 ├── Règle SUPAIP / NOTAM ───────────► Déduplication selon les 3 cas métier + traçabilité des fichiers sources
 ├── Référentiel Aérodromes (CSV) ─────► Résolution des codes LFXX (nom, localisation)
 └── Profil de Vol & Équipement ───────► Plafond prévu, route (départ / arrivée / contournements), vol sans radio
              │
              ▼
[RESTITUTIONS]
 ├── Écran 1 : Briefing & Carte ───────► Filtres, texte lisible, carte interactive, résumé WhatsApp, archivage PDF
 └── Écran 2 : Revue Instrument ──────► Instructions ordonnées Départ -> Arrivée + visualisation synchronisée

```

## 3. Écran 1 : Analyse SOFIA-Briefing & Cartographie

### 3.1 Entrées, Traitement Multi-Fichiers et Paramètres

* **Import PDF (unitaire ou multi-fichiers)** : Chargement d'un ou plusieurs dossiers générés depuis SOFIA-Briefing ($1 \dots N$ fichiers, par exemple plusieurs tronçons de route, plusieurs zones/aérodromes, ou un dossier de la veille combiné à un dossier du jour).

* **Traitement exhaustif** : Chaque fichier chargé est traité de bout en bout sans qu'aucun fichier ne soit ignoré, tronqué silencieusement ou écrasé par un chargement suivant dans la session.

* **Traçabilité & fraîcheur par fichier source** : Chaque information extraite (NOTAM, zone, créneau, validité) conserve le lien vers son fichier d'origine (nom de fichier, date/heure d'émission ou période de validité, périmètre/route concerné lorsque disponible), afin de distinguer clairement les écarts temporels ou de validité entre plusieurs dossiers.

* **Extraction des métadonnées du vol** : Aérodrome de départ (`LFXX`), destination, points de contournement, date/heure de décollage, durée, plafond prévu, largeur du couloir et rayons des demi-cercles départ/arrivée.

* **Table de référence CSV** : Correspondance codes OACI (`LFXX`) -> Nom complet et coordonnées GPS pour affichage lisible.

* **Filtre des paragraphes** : Boutons bascules (toggles). Par défaut, seuls **Aérodrome** et **Restriction En-Route** sont actifs.

### 3.2 Règles Métier de Filtrage (Déduplication SUPAIP / NOTAM)

L'application applique strictement les 3 cas suivants :

1. **SUPAIP sans NOTAM Trigger** -> **Afficher le SUPAIP**.

2. **SUPAIP avec NOTAM Trigger** -> **N'afficher que le NOTAM** (évite les doublons tout en conservant le lien vers le SUPAIP).

3. **NOTAM isolé** -> **Afficher le NOTAM**.

Lorsque plusieurs fichiers SOFIA-Briefing couvrent des zones proches ou contiguës, les doublons inter-fichiers sont dédupliqués ou regroupés proprement (en signalant les fichiers sources concernés) afin d'éviter la surcharge tout en conservant la traçabilité.

### 3.3 Distinction Visuelle & Cartographie Interactive

* **Code couleur strict** : Différenciation visuelle nette entre **Warning (`W`)** et **Zone Restreinte (`R`)** (sur les cartes texte et les polygones cartographiques).

* **Tracé du parcours** : Affichage des aérodromes (départ, contournement, arrivée), du couloir et des demi-cercles.

* **Curseur de rayon dynamique** : Slider permettant d'ajuster le rayon des restrictions représentées par un cercle ponctuel (**plage : démarre à 5 NM/km, défaut à 10**).

* **Gestion des contours SUPAIP connus vs génériques** :

  * Si le SUPAIP correspond à un polygone connu (base mensuelle), afficher son **contour réel détaillé**.

  * Fournir un bouton/interrupteur interactif permettant de masquer le cercle générique SOFIA associé.

  * **Pop-up au clic** : Affichage de la description complète aussi bien sur le contour SUPAIP connu que sur le contour générique SOFIA.

### 3.4 Export, Partage & Archivage

* **Résumé WhatsApp** : Génération automatique d'un texte synthétique formaté (emoji, horaires, plafonds, zones actives, lien direct vers le SUPAIP officiel en ligne) avec bouton **Copier en 1 clic**.

* **Sauvegarde locale** : Option d'enregistrement du PDF renommé selon la convention `PXA-BRIEFING-YYYYMMDD-NN.pdf` (avec incrément automatique) dans le dossier choisi par l'utilisateur (via File System Access API ou téléchargement).

## 4. Écran 2 : Revue de Configuration Instrument & Visualisation

### 4.1 Logique de Génération des Instructions et Source OpenAir

* La visualisation s'appuie sur les fichiers **OpenAir** (`samples/Openair_eAIP/`, `samples/Openair_SUPAIP/` et éventuels fichiers ponctuels `samples/Openair_Adhoc/`) croisés avec les paramètres de route et le **plafond** extraits du ou des dossiers **SOFIA-Briefing** chargés, ainsi que les autres couches de la chaîne EA (`ZSM`, `accords locaux FFVL` et vigilance vol sans radio).

* **Filtres de visualisation (inspiration d'interface adaptée) :** filtres d'affichage sur les couches/sources (dont `eAIP` / `Openair_eAIP`, `SUPAIP`, `NOTAM` / `Openair_Adhoc`, et repères `ZSM` / `accords locaux FFVL`), repère de date/validité (à titre indicatif de fraîcheur/cohérence, jamais comme calcul d'activation) et repère d'altitude rapporté au **plafond du SOFIA-Briefing**.

* **Tri chronologique/géographique** : Les instructions sont classées **du point de départ jusqu'à l'arrivée** (avec distance et relèvement depuis le décollage).

* **Traitement des AZBA** : Détection de l'intersection avec les zones du réseau très basse altitude ; l'activation n'est jamais simulée ni déduite localement, et une alerte systématique invite à vérifier l'activité du jour sur le portail/site dédié AZBA.

### 4.2 Exemples d'Instructions Générées (Sortie attendue)

* *Départ* : « Désactiver la **LTA** (plafond de vol prévu à 2 000 m). »

* *À 15 km (Axe NO)* : « Désactiver **R206** (Non active selon NOTAM). »

* *À 30 km* : « Garder active **R239** (Active sur le créneau). »

* *À 40 km* : « Attention : instruction spéciale pour **LAVL**. »

* *À 50 km* : « Attention Zone Restreinte — Pénétration autorisée sous condition de contact radio (rappel : vol sans radio -> contourner). »

### 4.3 Synchronisation Texte / Carte

* Écran partagé (PC) ou bascule rapide (Mobile) : survoler ou cliquer sur une instruction met en surbrillance la zone correspondante sur la carte et centre la vue dessus.

## 5. Jeux d'Essai, Règle AZBA & NOTAM Ponctuels

### 5.1 Jeux d'essai (`samples/`)

Les jeux d'essai locaux de `BRIEFING` sont organisés selon les sources utilisées par l'application :

* `samples/sofia_pdf/` : dossiers PDF SOFIA-Briefing types (parcours XC, SUP AIP avec/sans NOTAM Trigger, NOTAM isolés, cas multi-fichiers).

* `samples/aerodromes/` : fichiers CSV de résolution des codes aérodromes (`LFXX`) vers leurs noms lisibles. 

* `samples/Openair_SUPAIP/` : fichiers OpenAir individuels de SUP AIP connus, utilisés pour afficher le contour détaillé d'une zone, proposer le masquage du cercle générique issu de SOFIA-Briefing et afficher sa description au clic.

* `samples/Openair_eAIP/` : fichiers OpenAir issus du processus central de production, utilisés dans l'Écran 2 pour structurer et vérifier la configuration de l'instrument de vol.

### 5.2 Règle AZBA & Revue de Configuration Instrument (Écran 2)

* L'Écran 2 s'appuie sur le fichier OpenAir du processus central de production (`Openair_eAIP`), les paramètres du plan de vol SOFIA-Briefing et la chaîne EA afin de produire des consignes rédigées et classées du départ à l'arrivée (plafond face à la LTA, distance/axe/activité sur les zones, vigilance sans radio).

* **Vérification AZBA sur site dédié :** l'activation ou non des zones AZBA n'est ni simulée ni déduite localement par `BRIEFING`. Lorsqu'une AZBA est concernée, l'application signale sa présence et rappelle impérativement de consulter le **site web dédié AZBA** pour vérifier l'activation réelle du jour avant de régler ou valider l'instrument.

### 5.3 NOTAM de dernière minute (OpenAir ponctuel)

* Permettre à l'utilisateur de créer rapidement un petit fichier OpenAir via un écran de saisie guidée respectant le format OpenAir afin d'intégrer un NOTAM récent non présent dans les sources habituelles.

* `samples/Openair_Adhoc/` : exemples de fichiers OpenAir ponctuels (NOTAM de dernière minute créés via l'écran de saisie guidée).

## Entrées de données & arborescence OpenAir

Le projet **BRIEFING** s'appuie sur les couches et dossiers OpenAir suivants :
- `samples/Openair_eAIP/` : espaces aériens de référence (eAIP).
- `samples/Openair_SUPAIP/` : suppléments d'information aéronautique (SUP AIP).
- `samples/Openair_Adhoc/` : fichiers OpenAir saisis ponctuellement (NOTAM temporaires ou contraintes locales non couvertes par les couches standards).

## Interface utilisateur & cartographie (Mockup BRIEFING)

- **Vue 3 volets** :
  - **Gauche** : paramètres de vol (date, plafond visé en `FL` avec équivalence `FL × 30` en mètres), recherche et filtres par catégorie (`ZRT`, `SUP AIP`, `Parachutage`, `NOTAM`, `Adhoc`).
  - **Centre** : vue cartographique avec **sélecteur de fond de carte** (`Sombre PXA`, `Carte OACI / VFR`, `IGN / Topographique`, `Relief / Plaine`) et adaptation automatique du contraste, complétée par un **profil vertical schématique** (`SFC` → `FL085`).
  - **Droite** : indicateurs synthétiques, détail de la zone sélectionnée et bloc brut/OpenAir.
- **Écran de saisie assistée OpenAir Adhoc** :
  - Permet de saisir un NOTAM ponctuel (`AC`, `AN`, `AL`, `AH`, géométrie cercle `V X=` + `DC` ou polygone `DP`).
  - Offre un aperçu OpenAir en temps réel, l'ajout immédiat au briefing actif et l'export d'un fichier texte OpenAir destiné à `samples/Openair_Adhoc/`.

## Export

- L'export du mockup BRIEFING produit un **fichier texte au format OpenAir** (`.txt` / `.openair`) contenant les blocs OpenAir des zones filtrées / actives (y compris les zones `ADHOC` créées pendant la session), et non un export JSON.