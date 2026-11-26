    # BRIEFING — Assistant de Préparation Aéronautique Parapente (XC)

    Application web autonome (100 % client-side : HTML5 / CSS3 / JavaScript Vanilla) destinée aux pilotes de parapente de distance (XC). Elle permet de vérifier les dernières informations aéronautiques du jour ou du lendemain (notamment via **SOFIA-Briefing**) avant de mettre à jour l'instrument de vol (ex. XCTrack) avec les contraintes des espaces aériens.

    > **Avertissement :** outil d'aide à la préparation, à la visualisation et à la revue d'instrument. Il ne remplace ni le dossier officiel SOFIA-Briefing, ni les publications officielles (eAIP, SUPAIP, NOTAM, AZBA, ZSM, accords locaux FFVL), ni la responsabilité du pilote.

    ---

    ## Socle Technique & Contextes d'Usage
    * **Standard existant :** s'appuie sur le socle commun (**Logo**, `Core.js`, `Theme.css`, `STANDARD_UI`), adapté aux besoins de `BRIEFING`.
    * **Deux contextes d'usage (UX / Personas) :**
    * **J-1 (PC / Grand écran) :** analyse complète du plan de vol, gestion des contours SUPAIP, copie du résumé WhatsApp et archivage local du PDF.
    * **Jour J (Mobile / Terrain) :** lecture rapide, filtrage, alertes et suivi de la configuration instrument au décollage.

    ---

    ## Écran 1 — Analyse SOFIA-Briefing, Carte & Diffusion

    1. **Préparation & Import PDF :**
    * L'utilisateur prépare son plan de vol NOTAM dans SOFIA-Briefing (départ, arrivée, date/heure de décollage, durée, plafond/altitude de vol, largeur du couloir, largeur des demi-cercles départ/arrivée, points de contournement éventuels) et sauvegarde le PDF.
    * Chargement du PDF dans `BRIEFING`, affichage des paramètres utilisés pour la génération du plan de vol et résolution des noms des aérodromes (`LFXX`) via un fichier **CSV** dédié.
    2. **Sélection des paragraphes & texte lisible :**
    * Par défaut, **seuls 2 paragraphes sont sélectionnés** : **Aérodrome** et **Restriction En Route**.
    * Boutons de filtre sur les paragraphes affichés et mise en forme dans un texte compréhensible.
    3. **Logique de déduplication SUPAIP / NOTAM (3 cas) :**
    * **SUPAIP sans NOTAM Trigger** -> afficher le SUPAIP.
    * **SUPAIP avec NOTAM Trigger** -> n'afficher que le NOTAM.
    * **NOTAM isolé** -> afficher le NOTAM.
    4. **Distinction visuelle :**
    * Couleurs distinctes entre **Warning (`W`)** et **Zone Restreinte (`R`)**.
    5. **Carte interactive, rayons & contours SUPAIP :**
    * Affichage du parcours, des aérodromes (départ, arrivée, contournements) et des zones associées.
    * **Curseur de rayon** pour ajuster la taille de certaines restrictions représentées par un cercle : **démarre à 5**, **valeur par défaut à 10**.
    * **Contours SUPAIP connus (approche non centralisée) :** lorsque le contour d'un SUPAIP est connu (revue mensuelle / logique non centralisée partagée avec l'autre application), affichage du contour détaillé de la zone avec **option interactive pour masquer le cercle générique** associé issu de SOFIA-Briefing.
    * **Clic sur une zone :** affichage de la description, aussi bien pour un SUPAIP connu que pour un contour/cercle générique issu de SOFIA-Briefing.
    6. **Partage & Archivage :**
    * Génération d'un texte résumé copiable (ex. pour **WhatsApp**) incluant un **lien vers le SUPAIP** disponible en ligne.
    * Sauvegarde locale du PDF SOFIA-Briefing sous la forme **`PXA-BRIEFING-YYYYMMDD`** avec un **numéro incrémental**, dans un emplacement choisi par l'utilisateur.

    ---

    ## Écran 2 — Revue de Configuration Instrument & Visualisation

    * Écran distinct dédié à la vérification/mise à jour de la configuration de l'instrument de vol à partir des mêmes paramètres que le plan de vol SOFIA-Briefing, en intégrant la chaîne EA (**eAIP, SUPAIP, NOTAM, AZBA, ZSM, accords locaux FFVL**).
    * **Instructions rédigées et classées du départ à l'arrivée**, accompagnées d'une **visualisation synchronisée** :
    * *Exemple plafond :* désactiver la LTA si le plafond de vol prévu est inférieur (ex. plafond prévu à 2 000 m).
    * *Exemple distance / axe / activité :* à 15 km dans l'axe NO, désactiver `R206` non active ; à 30 km, garder `R239` active ; à 40 km, instruction spéciale pour `LAVL` ; à 50 km, attention zone restreinte (pénétration soumise à contact radio / vigilance sans radio).
    * **AZBA :** indiquer qu'une AZBA existe et qu'il faut **vérifier le site AZBA** pour connaître l'activité du jour.

    ---

    ## Documentation du Projet
    * `SPEC.md` : spécifications fonctionnelles, UX, *Data Lineage* et matrice des sources EA.
    * `PROMPT_MAITRE.md` : cadre de collaboration et règles de conception.
    * `PROMPTS_LOG.md` : historique des échanges et décisions.
    * `TESTS_UX.md` : scénarios de test et vérifications.