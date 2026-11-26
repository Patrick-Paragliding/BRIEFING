
### Scénario — Contours SUP AIP connus (`samples/Openair_SUPAIP/`)
- **Précondition :** un PDF SOFIA-Briefing contenant un SUP AIP connu est chargé et un fichier OpenAir correspondant est présent dans `samples/Openair_SUPAIP/`.
- **Action :** afficher la zone sur la carte de l'Écran 1, cliquer sur la zone, puis activer/désactiver l'option de masquage du cercle générique issu de SOFIA-Briefing.
- **Résultat attendu :** le contour détaillé OpenAir s'affiche, le cercle générique peut être masqué à la demande, et le clic sur la zone affiche sa description.

### Scénario — Revue de configuration instrument via `samples/Openair_eAIP/`
- **Précondition :** les paramètres du plan de vol SOFIA-Briefing sont chargés et un fichier de référence est disponible dans `samples/Openair_eAIP/`.
- **Action :** ouvrir l'Écran 2 avec un plafond prévu inférieur à une LTA et un parcours comportant des zones à différentes distances/axes.
- **Résultat attendu :** les instructions s'affichent du départ à l'arrivée avec la visualisation synchronisée, incluant la consigne adaptée au plafond (ex. désactivation de la LTA si plafond inférieur) et les rappels liés aux axes/distances et au vol sans radio.

### Scénario — Rappel de vérification AZBA sur le site web dédié
- **Précondition :** le plan de vol ou l'analyse de l'Écran 2 croise une zone AZBA.
- **Action :** consulter les consignes ou alertes de l'Écran 2.
- **Résultat attendu :** `BRIEFING` n'affiche aucun état « active » ou « inactive » calculé localement et affiche un message explicite invitant à vérifier l'activation du jour sur le **site web dédié AZBA**.