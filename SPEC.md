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

---

## 1. Personas & Parcours Utilisateur

| Persona | Moment d'usage | Support privilégié | Besoins clés |
| :--- | :--- | :--- | :--- |
| **Pilote Préparateur (J-1)** | Préparation du parcours et partage au groupe avant le jour du vol | **PC (Grand écran)** | Lire le PDF SOFIA-Briefing, vérifier les SUPAIP/NOTAM, ajuster les rayons/contours, copier le résumé WhatsApp, archiver le PDF renommé. |
| **Pilote au Décollage (Jour J)** | Dernières vérifications avant le décollage et mise à jour de l'instrument | **Smartphone (Mobile)** | Vérifier rapidement les contraintes actives/inactives sur le tracé, consulter l'alerte AZBA/ZSM/accords locaux, suivre l'ordre des actions sur l'instrument. |

---

## 2. Data Lineage & Chaîne de l'Information Aéronautique (EA)

L'information aéronautique croisée dans `BRIEFING` combine plusieurs sources distinctes avec un niveau d'automatisation et de vigilance adapté à chaque couche :

```text
[SOURCES D'INFORMATION]
 ├── eAIP / SIA (Cycle AIRAC) ─────────► Espaces permanents (CTR, TMA, LTA, ZIT/ZP/R/D) dans l'instrument
 ├── SOFIA-Briefing (PDF plan de vol) ──► Paramètres du vol + NOTAM + SUPAIP extraits sur le couloir
 ├── Revue SUPAIP (Non centralisée) ──► Contours connus des SUPAIP (approche non centralisée partagée avec l'autre appli)
 ├── Portail SIA / AZBA (Jour J) ─────► Réseau Très Basse Altitude (RTBA) — Vérification manuelle obligatoire
 ├── Base ZSM / Biodiv'Sports ────────► Zones de Sensibilité Majeure (enjeux écologiques / saisonniers)
 └── Accords Locaux FFVL ─────────────► Protocoles locaux / règles spécifiques / conditions radio
              │
              ▼
[TRAITEMENT & CROISEMENT DANS BRIEFING]
 ├── Extraction PDF & Filtres ─────────► Par défaut : "Aérodrome" et "Restriction En Route" sélectionnés
 ├── Règle SUPAIP / NOTAM ───────────► Déduplication selon les 3 cas métier
 ├── Référentiel Aérodromes (CSV) ─────► Résolution des codes LFXX (nom, localisation)
 └── Profil de Vol & Équipement ───────► Plafond prévu, route (départ / arrivée / contournements), vol sans radio
              │
              ▼
[RESTITUTIONS]
 ├── Écran 1 : Briefing & Carte ───────► Filtres, texte lisible, carte interactive, résumé WhatsApp, archivage PDF
 └── Écran 2 : Revue Instrument ──────► Instructions ordonnées Départ -> Arrivée + visualisation synchronisée


---

## 2. Écran 1 : Analyse SOFIA-Briefing & Cartographie

### 2.1 Entrées et Paramètres
* **Import PDF** : Chargement d'un dossier généré depuis SOFIA-Briefing.
* **Extraction des métadonnées du vol** : Aérodrome de départ (`LFXX`), destination, points de contournement, date/heure de décollage, durée, plafond prévu, largeur du couloir et rayons des demi-cercles départ/arrivée.
* **Table de référence CSV** : Correspondance codes OACI (`LFXX`) -> Nom complet et coordonnées GPS pour affichage lisible.
* **Filtre des paragraphes** : Boutons bascules (toggles). Par défaut, seuls **Aérodrome** et **Restriction En-Route** sont actifs.

### 2.2 Règles Métier de Filtrage (Déduplication SUPAIP / NOTAM)
L'application applique strictement les 3 cas suivants :
1. **SUPAIP sans NOTAM Trigger** -> **Afficher le SUPAIP**.
2. **SUPAIP avec NOTAM Trigger** -> **N'afficher que le NOTAM** (évite les doublons tout en conservant le lien vers le SUPAIP).
3. **NOTAM isolé** -> **Afficher le NOTAM**.

### 2.3 Distinction Visuelle & Cartographie Interactive
* **Code couleur strict** : Différenciation visuelle nette entre **Warning (`W`)** et **Zone Restreinte (`R`)** (sur les cartes texte et les polygones cartographiques).
* **Tracé du parcours** : Affichage des aérodromes (départ, contournement, arrivée), du couloir et des demi-cercles.
* **Curseur de rayon dynamique** : Slider permettant d'ajuster le rayon des restrictions représentées par un cercle ponctuel (**plage : démarre à 5 NM/km, défaut à 10**).
* **Gestion des contours SUPAIP connus vs génériques** :
  * Si le SUPAIP correspond à un polygone connu (base mensuelle), afficher son **contour réel détaillé**.
  * Fournir un bouton/interrupteur interactif permettant de masquer le cercle générique SOFIA associé.
  * **Pop-up au clic** : Affichage de la description complète aussi bien sur le contour SUPAIP connu que sur le contour générique SOFIA.

### 2.4 Export, Partage & Archivage
* **Résumé WhatsApp** : Génération automatique d'un texte synthétique formaté (emoji, horaires, plafonds, zones actives, lien direct vers le SUPAIP officiel en ligne) avec bouton **Copier en 1 clic**.
* **Sauvegarde locale** : Option d'enregistrement du PDF renommé selon la convention `PXA-BRIEFING-YYYYMMDD-NN.pdf` (avec incrément automatique) dans le dossier choisi par l'utilisateur (via File System Access API ou téléchargement).

---

## 3. Écran 2 : Revue de Configuration Instrument & Visualisation

### 3.1 Logique de Génération des Instructions
* Utilise les mêmes paramètres de route et de plafond extraits du SOFIA-Briefing.
* **Tri chronologique/géographique** : Les instructions sont classées **du point de départ jusqu'à l'arrivée** (avec distance et relèvement depuis le décollage).
* **Traitement des AZBA** : Détection de l'intersection avec les zones du réseau très basse altitude et affichage d'une alerte systématique invitant à vérifier l'activité du jour sur le portail SIA/AZBA.

### 3.2 Exemples d'Instructions Générées (Sortie attendue)
* *Départ* : « Désactiver la **LTA** (plafond de vol prévu à 2 000 m). »
* *À 15 km (Axe NO)* : « Désactiver **R206** (Non active selon NOTAM). »
* *À 30 km* : « Garder active **R239** (Active sur le créneau). »
* *À 40 km* : « Attention : instruction spéciale pour **LAVL**. »
* *À 50 km* : « Attention Zone Restreinte — Pénétration autorisée sous condition de contact radio (rappel : vol sans radio -> contourner). »

### 3.3 Synchronisation Texte / Carte
* Écran partagé (PC) ou bascule rapide (Mobile) : survoler ou cliquer sur une instruction met en surbrillance la zone correspondante sur la carte et centre la vue dessus.