# Contexte.md — Gestion des espaces aériens en vol libre (XC)
## Vision, mission et objectif

Périmètre du projet :

Vision : favoriser une coexistence sûre et durable entre le vol libre et les autres usagers de l'espace aérien grâce à une information fiable, accessible et compréhensible.

Mission : rendre le respect des espaces aériens aussi simple que possible pour les pilotes de vol libre.

Objectif : produire et maintenir un OpenAir de référence, fiable, traçable et à jour, afin que tout ce qui peut être préparé avant le vol le soit déjà, et que les vérifications de dernière minute se concentrent sur les informations réellement dynamiques (notamment en cross-country de plaine, avec ou sans radio aéronautique).

Architecture & posture : passer d'une logique centralisée (« tout faire au même endroit ») à une approche décentralisée et modulaire où chaque domaine assume clairement son périmètre et sa responsabilité. Le dispositif est souvent plus pertinent qu'il n'y paraît, mais souffre parfois d'un défaut de communication ou de lisibilité sur le rôle de chacun.

Préparation & vérifications dynamiques : disposer d'un fond d'espace aérien exploitable sur l'instrument de vol (ex. XCTrack), le croiser avec SOFIA-Briefing, vérifier l'activation réelle sur le site web dédié AZBA (sans calcul automatique d'activation locale), s'appuyer sur les outils spécialisés pertinents (comme SpotAiR synchronisé chaque nuit pour les ZSM avec DREAL Aquitaine et FFVL) et opérer une sélection/désélection ciblée des zones selon le vol et l'équipement radio.

Rôle du document : poser le cadre commun pour des bénévoles aux profils variés et préparer la conception ultérieure d'un diagramme one page synthétique, en articulation avec les autres documents du projet (SPEC.md, TESTS_UX.md, PROMPTS_LOG.md, PROMPT_MAITRE.md).

---

## 2. Dépasser le modèle « tout en un point central »
* **Les limites d'un point central unique :** chercher à concentrer dans un même endroit des informations qui n'ont ni la même fréquence, ni la même nature, ni la même durée de vie (socle structurel sur cycle AIRAC de 28 jours, contraintes temporaires, événements ponctuels, activations dynamiques, sensibilités environnementales et règles locales) crée de la complexité et des points de fragilité.
* **Décentraliser les rôles et le « L » par domaine :** répartir les responsabilités entre des domaines clairs permet à chacun de rester léger, lisible et maintenable. L'idée directrice est que **chaque domaine produit son propre « L » (sa donnée maître)** : une fois ce « L » posé pour le domaine, **il n'y a plus de modification, uniquement de la consommation**.
* **Aucun filtre « sans radio » dans la donnée maître :** le « L » ne doit pas écarter des espaces au motif que certains pilotes volent sans radio ; en plaine, on peut voler avec ou sans radio, et c'est au moment de la **consommation** (préparation, sélection/désélection sur l'instrument, décision pilote) que l'emport ou non d'une VHF est géré.
* **Ce principe dans le paysage actuel :** le filtrage de type VFR (sous FL195 / classes E, F, G) et la mise à disposition séparée des *Zones à risque* (classe Q, à fusionner si souhaité) autour d'initiatives liées au SIA et à **HEHOL** (en complément d'approches comme `planeur-net/airspace` ou d'emballages techniques au conditionnel comme `poaff-as-a-service`) illustrent une logique de tri pertinent, sous réserve de la fiabilité de la transformation (« moulinette ») et de sa maintenance.
* **Distinguer le Data Owner de celui qui expose :** dans une chaîne décentralisée, l'entité qui détient ou porte la donnée (**Data Owner**) ne se confond pas avec l'outil ou le site qui l'expose ou la diffuse.
* **Demander plutôt que supposer :** plutôt que d'interpréter ou de deviner la mécanique interne de chaque acteur ou outil aval (**HEHOL**, **XCTrack**, outils de préparation ou de revue), la démarche consiste à **demander à chaque chaîne d'expliquer son propre fonctionnement**.

---

## 3. Les 4 maillons de la chaîne d'information

1. **Socle structurel (eAIP / cycle AIRAC)**
   * **Rôle :** espaces aériens pérennes ou structurants (CTR, TMA, LTA, zones réglementées `R`/`D`/`P`, axes, limites verticales).
   * **Source & rythme :** Service de l'Information Aéronautique (SIA) — publications officielles et produits numériques en libre disposition selon le **cycle AIRAC (28 jours)**, avec parfois le cycle suivant disponible en amont.
   * **Point clé :** il n'existe pas de fichier OpenAir unique « officiel » directement calibré pour le vol libre ; la transformation vers OpenAir (avec variantes *avec/sans topo*, filtrage VFR, découpages régionaux ou jours d'activation, et *Zones à risque* séparées, **sans filtre lié à l'absence de radio**) joue un rôle central pour produire le « L » du domaine.

2. **Temporaire structuré (SUP AIP)**
   * **Rôle :** contraintes temporaires de durée limitée (travaux, exercices, manifestations, activations sur plusieurs semaines ou mois).
   * **Source & rythme :** SIA — bulletins SUP AIP publiés périodiquement ou au fil des évolutions.
   * **Point clé :** nécessite un tri (pertinent vs. hors périmètre XC), une traduction OpenAir fiable, un suivi des dates d'effet et un retrait propre à l'expiration.

3. **Dernière minute / ponctuel (NOTAM & zones Adhoc)**
   * **Rôle :** événements ponctuels, activations courtes ou évolutions récentes non encore intégrées au socle ou aux SUP.
   * **Source & rythme :** SIA / dossiers SOFIA-Briefing en temps réel, la veille (J-1) ou le jour du vol (Jour J) ; côté préparation/revue, création possible de fichiers OpenAir ponctuels (**Adhoc**, ex. stockés dans `samples/Openair_Adhoc/`).
   * **Point clé :** écart fréquent entre le texte d'un NOTAM et une géométrie exploitable, et nécessité d'écarter ou purger les éléments périmés.

4. **Activation dynamique, militaire & règles locales (AZBA, ZSM, FFVL, vol plaine avec/sans radio)**
   * **Rôle :** activation réelle du jour des zones militaires (AZBA), zones de sensibilité environnementale/faune (ZSM), consignes fédérales/locales (FFVL) et adaptation au vol XC de plaine, avec ou sans radio aéronautique.
   * **Sources & rythme :** portail web dédié **AZBA** (contrôle quotidien / par créneau), filières spécialisées et bases dédiées (ex. **ZSM**), règles locales et fédérales.
   * **Règles clés :**
     * l'activation des zones AZBA se vérifie directement sur le **site web dédié AZBA** (sans calcul ou simulation automatique d'activation locale) ;
     * lorsque l'export générique pose difficulté (comme pour les **ZSM**), une filière identifiée et soutenue apporte un repère clair (voir l'exemple directionnel ci-dessous).

---

## 4. Préparation des données d'entrée (Input Data Preparation — socle SIA)
Pour le traitement du socle d'espaces aériens issu des bases numériques du SIA en libre disposition :
1. **Téléchargement des données SIA :** récupération de l'archive ZIP correspondant au cycle AIRAC concerné sur le portail des bases de données numériques du SIA (`https://www.sia.aviation-civile.gouv.fr/produits-numeriques-en-libre-disposition/les-bases-de-donnees-sia.html`).
2. **Structure attendue de l'archive ZIP :**
   * `AIXM4.5_all_FR_OM_YYYY-MM-DD.xml` : définitions des espaces aériens au format AIXM 4.5 ;
   * `XML_SIA_YYYY-MM-DD.xml` : fréquences et données complémentaires au format XML.
3. **Convention de nommage :**
   * XML : `XML_SIA_YYYY-MM-DD.xml`
   * AIXM : `AIXM4.5_all_FR_OM_YYYY-MM-DD.xml`

*Note de prudence au conditionnel :* les références à des outils, reprises ou emballages techniques autour de ces fichiers (tels que **HEHOL** ou des initiatives comme `poaff-as-a-service`) sont mentionnées au conditionnel sans préjuger d'un audit direct du code ; la question clé reste de savoir qui porte et maintient la transformation (*custodian* / responsable) d'un cycle AIRAC à l'autre.

---

## 5. Exemple directionnel : cas des ZSM et de SpotAiR
Lorsque la disponibilité ou l'export générique d'une donnée sensible pose difficulté (comme pour les **ZSM**), un modèle directionnel clair consiste à articuler une responsabilité identifiée, un soutien fédéral et un outil dédié :
* **Responsabilité & source (Data Owner / périmètre) :** centralisation nationale des données ZSM gypaète portée par la **DREAL Aquitaine**.
* **Soutien fédéral :** outil parrainé / sponsorisé par la **FFVL**, inscrivant l'usage dans le cadre fédéral du vol libre.
* **Diffusion / mise à jour :** synchronisation automatique quotidienne (**chaque nuit**) de l'application **SpotAiR** sur les serveurs correspondants.
* **Apport opérationnel :** lecture directe de la localisation précise, du statut (`active` / `inactive`), des périodes associées et des limites spatiales (avec tutoriel vidéo d'interprétation), à intégrer à la préparation du vol aux côtés de **SOFIA-Briefing**, du **site web dédié AZBA**, des règles locales et de la vigilance liée au vol en plaine (avec ou sans radio).

---

## 6. Guide didactique de Data Management et qualité de la donnée (pour bénévoles)

### Gestion de la donnée et ETL par l'exemple (et « ETL de bonne volonté »)
Plutôt que d'abstraire la notion d'ETL, prenons un cas très concret : le **Data Owner métier** est souvent l'organisme ou l'autorité à l'origine du besoin ou de la contrainte, tandis que le **SIA** joue le rôle de *Data Publisher of Record* et constitue **la source de référence officielle pour l'utilisateur**. À gauche de la boîte SIA, il existe déjà un véritable **ETL officiel** : des informations issues de diverses sources et autorités sont collectées, structurées, normalisées et publiées, mais **seul le « L » du SIA nous est exposé** (par exemple les archives AIRAC ou les bulletins SUP AIP). On n'a donc pas à refaire ou rouvrir ce qui se passe en amont de cette publication officielle ; le « L » exposé par le SIA devient simplement notre point d'entrée (**E**). Vient ensuite, côté vol libre, un **« ETL de bonne volonté »** — souvent porté par des initiatives bénévoles ou communautaires — qui trie, adapte et convertit cette matière (par exemple vers un socle OpenAir exploitable, **sans filtre « sans radio » en amont**) pour produire **le « L » de notre domaine**, à partir duquel on passe en **consommation pure** sans retouche aval : croisement avec **SOFIA-Briefing**, contrôle direct sur le **site web dédié AZBA** (sans calcul automatique local), consultation de **SpotAiR** (synchronisé chaque nuit pour les ZSM avec **DREAL Aquitaine** et **FFVL**), respect des règles locales et décision finale du pilote en XC plaine, avec ou sans radio. C'est d'ailleurs exactement la même logique pour les **NOTAM** : pas de « L » intermédiaire utile à gérer sur une base brute qui n'en produit pas pour notre besoin, le seul « L » officiel exploitable étant **SOFIA-Briefing**.

### Les repères essentiels de gestion des données (E, T, L et donnée maître)
Pour que chaque bénévole puisse lire et documenter la chaîne simplement, sans jargon inutile :
* **Donnée maître :** la version de référence la plus pertinente et la plus à jour pour un domaine donné (par exemple le socle d'un cycle AIRAC ou l'état d'une zone). Une donnée maître a toujours un périmètre et une durée de validité : elle éclaire la préparation, mais ne remplace jamais les contrôles du jour (**SOFIA-Briefing**, site **AZBA**, **SpotAiR**, règles locales, vol avec ou sans radio).
* **E — Extract (récupérer) :** d'où provient l'information brute et comment est-elle récupérée ?
* **T — Transform (trier et adapter) :** comment l'information est-elle filtrée, convertie ou mise en forme pour être exploitable (sans appliquer de filtre « sans radio » dans le socle) — et qui assure la responsabilité / maintenance de cette transformation ?
* **L — Load (diffuser / charger — donnée maître du domaine) :** où et comment la donnée prête à l'emploi est-elle publiée, stockée ou chargée pour ce domaine ? **Une fois le « L » posé pour chaque domaine, il n'y a plus de modification : la suite relève uniquement de la consommation.**
* **P — Produit la donnée maître :** quel maillon ou acteur délivre la donnée maître de référence pour ce domaine, et dans quelles limites ?

### Repères simples sur la qualité de la donnée
Pour juger rapidement de la fiabilité d'une information tout au long de la chaîne :
* **Exactitude :** la donnée correspond-elle bien à la réalité attendue (géométrie, altitudes, statut actif/inactif) ?
* **Complétude :** l'ensemble des informations utiles au périmètre est-il présent, ou manque-t-il une couche complémentaire (SUP AIP, NOTAM / Adhoc, ZSM via **DREAL Aquitaine** / **SpotAiR** / **FFVL**, contrôle **AZBA**) ?
* **Actualité :** la donnée est-elle toujours en vigueur au moment du vol (cycle AIRAC de 28 jours, dates d'effet et d'expiration), sans traîner d'informations périmées (« zones fantômes ») ?
* **Cohérence :** les repères, nommages et règles restent-ils concordants entre les outils de préparation, l'instrument de vol et les contraintes du vol (XC plaine, avec ou sans radio) ?
* **Traçabilité :** sait-on d'où vient la donnée, comment elle a été transformée (**E / T / L**), qui porte la transformation et quelles sont les limites connues ?

---

## 7. Demander un rapport E / T / L / P à chaque chaîne
Plutôt que de reconstruire par hypothèse la chaîne interne de chaque acteur ou outil, chaque chaîne identifiée (notamment **HEHOL**, l'écosystème **XCTrack**, les outils de préparation ou de revue, et les filières dédiées comme les **ZSM** via **DREAL Aquitaine**, **SpotAiR** et **FFVL**) est invitée à expliquer de manière factuelle :
1. **E (Extract) :** quelles sources d'entrée sont récupérées et comment ?
2. **T (Transform) :** quelles transformations/filtrages sont appliqués (et confirmation qu'aucun filtre « sans radio » n'écarte d'espaces au niveau de la donnée maître), par qui est porté/maintenu le code ou le processus, et quels sont les points d'incertitude ?
3. **L (Load) :** où et comment la donnée maître du domaine est-elle produite/mise à disposition, à partir de quel point il n'y a plus de modification ?
4. **P (Donnée maître) :** quelle donnée maître est produite/rendue disponible, avec quelle fraîcheur, quelles limites d'usage et quelles vérifications complémentaires restent à faire avant ou pendant le vol ?

> **🔵 Question ouverte *(approche transitoire en attente d'un outil plus générique au-delà du parapente)* :** verriez-vous un intérêt — ou des limites — à cibler davantage l'extraction (**E**) sur le besoin parapente et à limiter le nombre de formats en sortie à un socle **OpenAir** resserré plutôt que de multiplier les exports ?

---

### Modèle de demande à adresser aux acteurs / mainteneurs

Dans le cadre de notre travail de documentation décentralisée sur les espaces aériens en vol libre (notamment pour le cross-country de plaine, avec ou sans radio aéronautique), nous cherchons à clarifier le rôle de chaque domaine plutôt que de tout concentrer ou de supposer le fonctionnement interne des outils.

Notre règle de fonctionnement est simple :
- Chaque domaine produit son propre **L (Load)** : la **donnée maître** de ce domaine (la version de référence prête à l'emploi, avec son périmètre et sa durée de validité).
- **Une fois le « L » posé pour le domaine, il n'y a plus de modification : la suite relève uniquement de la consommation** (affichage, sélection/désélection selon l'équipement radio et l'axe du jour, contrôle du jour, décision du pilote).

Pourriez-vous nous aider à documenter votre chaîne (ou votre périmètre) en quelques lignes autour de ces points ? (Pas besoin d'entrer dans un niveau trop technique, l'objectif est d'être clair pour des bénévoles) :

1. **E — Extract (récupération) :**
   - D'où proviennent les données d'entrée et comment sont-elles récupérées (fréquence, cycle AIRAC, sources officielles ou bases dédiées) ?

2. **T — Transform (tri / mise en forme) :**
   - Quelles règles de filtrage, de conversion ou de structuration sont appliquées (en confirmant notamment qu'aucun filtre « sans radio » n'écarte d'espaces au niveau de la donnée maître) ?
   - Qui porte ou maintient cette transformation aujourd'hui, et quels sont les points d'attention ou limites connus ?

3. **L — Load (donnée maître du domaine — fin des modifications) :**
   - Où et comment est produite ou mise à disposition la donnée prête à l'emploi de votre domaine ?
   - À partir de quel point considérez-vous que la donnée est figée pour votre domaine et qu'elle passe en consommation pure (sans retouche en aval) ?

4. **P — Produit la donnée maître (périmètre, fraîcheur et vigilance) :**
   - Quelle est concrètement la donnée maître délivrée par votre chaîne ?
   - Quelle est sa fraîcheur / durée de validité, et quelles sont les vérifications complémentaires qui restent indispensables avant ou pendant le vol (ex. **SOFIA-Briefing**, contrôle direct sur le **site web dédié AZBA**, **SpotAiR** / **DREAL Aquitaine** / **FFVL** pour les ZSM, règles locales) ?

> **🔵 Question ouverte — Ciblage parapente et sortie OpenAir resserrée *(approche transitoire en attente d'un outil plus générique au-delà du parapente)* :** verriez-vous un intérêt — ou des limites — à disposer d'une extraction (**E**) spécifiquement ciblée pour le parapente avec un nombre de formats réduit en sortie, centré sur **OpenAir** ?

---

## 8. Synthèse et parcours opérationnel du pilote

| Maillon / Sujet | Source / Référence | Fréquence / Rythme | Rôle dans la chaîne décentralisée |
| :--- | :--- | :--- | :--- |
| **eAIP (socle)** | SIA (archive ZIP AIRAC : AIXM 4.5 + XML SIA) ; compilations / **HEHOL** (et alternatives) | Cycle AIRAC (28 jours) | Fournit le socle d'espaces aériens à filtrer/adapter (notamment VFR, variantes *avec/sans topo*, *Zones à risque* séparées, sans filtre « sans radio ») pour produire le « L » du domaine ; demande d'explication E/T/L/P. |
| **SUP AIP** | SIA | Périodique / au fil des publications | Couvre les contraintes temporaires ; exige tri, suivi de validité et retrait à expiration. |
| **NOTAM / Adhoc** | SIA / **SOFIA-Briefing** / fichiers ponctuels (`samples/Openair_Adhoc/`) | Temps réel / J-1 / Jour J | Traite les évolutions ponctuelles ou récentes ; suppose un nettoyage des éléments périmés. |
| **AZBA** | Site web dédié **AZBA** | Quotidienne / par créneau | Vérification directe sur le site dédié (pas de calcul automatique d'activation locale). |
| **ZSM & règles locales** | **DREAL Aquitaine** (ZSM gypaète), **SpotAiR** (soutien **FFVL**), règles locales / plaine (avec/sans radio) | Synchronisation nocturne (**SpotAiR**) ou variable | Exemple directionnel combinant responsabilité claire, outil dédié à jour et cadre fédéral, à croiser avec les règles locales. |

**Parcours type du pilote :**
1. S'appuyer sur un socle AIRAC propre, des SUP AIP actifs et d'éventuels fichiers `Openair_Adhoc` pertinents.
2. Faire le briefing du jour avec **SOFIA-Briefing**, vérifier l'activation sur le **site web dédié AZBA** et consulter **SpotAiR** (et les règles locales) pour les ZSM.
3. Sélectionner ou désélectionner les zones sur l'instrument (ex. **XCTrack**) en fonction de l'axe, du plafond prévu et du vol en plaine (avec ou sans radio).
4. Purger/ignorer les informations expirées et garder la responsabilité finale du vol[cite: 1].