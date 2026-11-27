### Contexte à rappeler 

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