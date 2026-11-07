# Dashboard Esteban

Tableau de bord « smart display » pour une vieille tablette Android en mode paysage. Il affiche l'heure, la date, la météo, des actualités, des citations, en option, le morceau en cours d'écoute sur Spotify.

Le projet est une page statique : HTML, CSS et JavaScript ES5, sans React, sans npm, sans étape de compilation et sans serveur.

## Ce que fait le tableau de bord

- **Horloge** très grande, en format 24 h, avec la date en français sous l'heure.
- **Météo** de Gazeran (Yvelines), mise à jour toutes les 15 minutes, avec une teinte d'ambiance selon le temps (chaude pour le soleil, bleue pour la pluie, grise pour les nuages).
- **Actualités** : un titre à la fois, avec la source et l'heure de publication, qui change toutes les 10 minutes. La carte est masquée hors ligne.
- **Citations** en français : une citation par heure, et une « Citation du jour » mise en avant chaque matin entre 07:00 et 09:00.
- **Spotify** (optionnel) : pendant la lecture, l'heure se réduit et la pochette du morceau devient l'élément principal, avec le titre, l'artiste et le temps écoulé. Sans configuration, ou si rien ne joue, la carte est remplacée par les citations. La pochette est agrandie et centrée ; si elle ne charge pas, un visuel sobre remplace le carré noir. Lors d'un changement de morceau, la nouvelle pochette apparaît en fondu par-dessus l'ancienne.
- **Mode nuit** de 21:30 à 07:00 : fond noir, seules l'heure, la date et la météo restent visibles.
- **Mode veille** : après 30 minutes sans morceau ni match, le tableau de bord ne garde que l'heure, la météo et une citation. Il revient seul quand Spotify ou un match démarre.
- **Plein écran** : géré par le navigateur, sans bouton à l'écran.
- **Indicateur de connexion** très discret (en ligne ou hors ligne), affiché quelques secondes après un changement.
- **Écran de démarrage** « Dashboard Esteban » pendant quelques secondes.

## Configuration requise

- Une tablette ou un navigateur capable d'afficher une page web. Le projet vise Android 5.1 (Remix OS) et fonctionne aussi sur un ordinateur ou un téléphone récent.
- Une connexion Internet pour la météo, les actualités, et Spotify. Sans connexion, l'horloge et les citations fonctionnent toujours.
- Aucun compte n'est obligatoire. Last.fm et les services de données sont optionnels.

## Compatibilité Android 5.1

- HTML, CSS et JavaScript ES5 uniquement. Pas de modules, pas de `async` / `await`, pas de `let` / `const`, pas de fonctions fléchées.
- Mise en page en Flexbox (préfixes `-webkit-` inclus). Pas de CSS Grid, pas de variables CSS, pas de `backdrop-filter`.
- Requêtes réseau par `XMLHttpRequest`, sans `fetch`.
- Animations légères (opacité uniquement), sans effets coûteux.

Ces points sont appliqués dans le code, mais le projet doit être testé sur l'appareil réel. Les versions du navigateur Remix OS peuvent varier.

## Installation rapide

Aucune installation n'est nécessaire. Il suffit d'ouvrir `index.html` dans un navigateur, ou de l'héberger (voir plus bas).

## Lancer en local

1. Téléchargez ou clonez le dossier du projet.
2. Ouvrez `index.html` dans Chrome, Firefox ou Edge.

Pour tester depuis un autre appareil sur le même réseau, lancez un serveur statique dans le dossier, par exemple avec Python :

```
python -m http.server 8000
```

Puis ouvrez `http://IP_DE_VOTRE_PC:8000` sur la tablette.

## Déployer sur GitHub Pages

1. Créez un dépôt public nommé, par exemple, `dashboard-esteban`.
2. Ajoutez les fichiers du projet à la racine du dépôt : `index.html`, `style.css`, `script.js`, `quotes.js`, `weather.js`, `news.js`.
3. Dans **Settings > Pages**, choisissez **Deploy from a branch**, la branche `main` et le dossier `/ (root)`.
4. Attendez quelques minutes. L'adresse sera de la forme `https://VOTRE-NOM.github.io/dashboard-esteban/`.
5. Ouvrez cette adresse sur la tablette, puis passez en plein écran via le navigateur si besoin.

Important : tout le code, y compris votre clé Last.fm si vous la renseignez, est public sur GitHub Pages. Ne mettez jamais de mot de passe ou de clé privée dans ce projet. Une clé Last.fm en lecture seule est acceptable mais reste visible par tous.

## Structure du projet

```
dashboard-esteban/
├── README.md
├── index.html
├── style.css
├── script.js
├── quotes.js
├── weather.js
└── news.js
```

Rôle des fichiers :

- `index.html` : structure de la page et chargement des scripts dans cet ordre : `quotes.js`, `weather.js`, `news.js`, `script.js`.
- `style.css` : apparence, animations, mode nuit, mode veille.
- `script.js` : horloge, mode nuit, citations, Spotify via Last.fm, mode veille, indicateur de connexion, et démarrage. Il coordonne les autres modules.
- `quotes.js` : liste des citations et liste personnelle `USER_QUOTES`.
- `weather.js` : météo Open-Meteo et teinte d'ambiance.
- `news.js` : actualités via des flux RSS convertis en JSON.

## Spotify et Last.fm

Spotify ne fournit plus l'écoute en cours aux comptes gratuits via son API web, et l'API exige un abonnement Premium pour les applications en mode développement. Le tableau de bord passe donc par Last.fm, qui reçoit l'historique d'écoute de Spotify.

Principe : Spotify envoie l'écoute à Last.fm, et le tableau de bord lit le « morceau en cours » sur Last.fm.

### Étapes

1. Créez un compte gratuit sur [last.fm](https://www.last.fm).
2. Connectez Spotify : dans Last.fm, allez dans **Réglages > Applications** et cliquez sur **Connect** à côté de **Spotify Scrobbling**. Ce n'est pas une fonction Premium.
3. Créez une clé API gratuite sur [last.fm/api/account/create](https://www.last.fm/api/account/create). Notez la clé (API key).
4. Ouvrez `script.js` et renseignez le bloc `CONFIG` :

```javascript
var CONFIG = {
  lastfmApiKey: 'VOTRE_CLE_API',
  lastfmUser: 'VOTRE_PSEUDO_LASTFM'
};
```

5. Rechargez le tableau de bord. Quand vous écoutez un morceau sur Spotify, la carte apparaît avec la pochette, le titre et l'artiste.

Tant que `lastfmApiKey` ou `lastfmUser` reste vide, le tableau de bord affiche simplement les citations. Aucun message d'erreur n'est affiché.

### Limites

- Le délai entre le début d'un morceau et son apparition peut être de quelques dizaines de secondes.
- Last.fm ne fournit pas la position de lecture : le temps affiché est estimé à partir du moment où le morceau est détecté. Il peut être décalé de quelques secondes, et il continue de défiler pendant une pause. La barre et la durée n'apparaissent que si Last.fm connaît la durée du morceau.
- La requête est faite depuis le navigateur. Si Last.fm n'accepte pas ce type d'appel depuis votre domaine, la carte Spotify ne s'affichera jamais, sans erreur visible. Dans ce cas, les citations restent affichées.
- L'usage de l'API Last.fm est réservé à un usage non commercial, conformément à ses conditions.

## Système météo

- Source : [Open-Meteo](https://open-meteo.com), gratuit et sans clé.
- Position : coordonnées fixes de Gazeran, réglées dans `weather.js` (`LAT` et `LON`). Il n'y a pas de géolocalisation. Les coordonnées sont approximatives et peuvent être ajustées.
- Actualisation : toutes les 15 minutes.
- Affichage : icône, température et condition. La condition est traduite en français à partir du code météo.
- Teinte d'ambiance : chaude pour le soleil, grise pour les nuages, bleue pour la pluie, violette pour l'orage, claire pour la neige, grise et douce pour le brouillard. Elle est appliquée par CSS, sans calcul lourd.

Si la météo ne répond pas, la carte reste masquée.


## Système d'actualités

- Sources : flux RSS publics (BFMTV, France Info, Le Monde, Le Figaro, L'Équipe, Numerama), convertis en JSON par le service gratuit [rss2json](https://rss2json.com). Les flux technologie et sciences sont prioritaires ; un flux en échec est simplement ignoré.
- Sujets : technologie, sciences, France et actualité générale. Un filtre simple écarte les titres politiques ou de type « clickbait ».
- Affichage : un titre court, la source et l'heure de publication.
- Rotation : toutes les 15 minutes, avec un fondu doux. Le texte ne change jamais brusquement.
- Si moins de 3 titres sont disponibles, la rotation s'arrête et le titre le plus récent reste affiché.
- Si la source ne répond pas, la carte est masquée sans message d'erreur.
- Actualisation des flux : toutes les heures. Après une actualisation, le titre affiché reste le même et la rotation continue dans le même ordre.
- Hors ligne : la carte est masquée.

Les adresses des flux doivent être vérifiées (celles-ci ne l'ont pas encore été) et peuvent être modifiées dans le tableau `FEEDS` de `news.js`.

## Plein écran

Le tableau de bord n'affiche aucun bouton de plein écran. Utilisez les commandes du navigateur :

- Ordinateur : touche F11 pour entrer ou sortir du plein écran.
- Échap pour quitter le plein écran.
- Tablette : menu du navigateur, si celui-ci propose le plein écran.

Le tableau de bord ne verrouille jamais Android et ne bloque pas la sortie.

## Mode nuit

- Actif de 21:30 à 07:00, heure du navigateur.
- Fond noir, seules l'heure, la date et la météo restent visibles.
- Les cartes citation, Spotify et actualités sont masquées.

## Mode veille

Après 30 minutes sans morceau Spotify, le tableau de bord ne garde que l'heure, la date, la météo et une citation. Il revient automatiquement quand un morceau commence.

## Personnaliser les citations

Ouvrez `quotes.js`. Chaque citation a la forme suivante :

```javascript
{
  text: 'Votre citation.',
  author: 'Auteur réel',
  category: 'Philosophie'
}
```

Catégories autorisées : `Proverbe français`, `Philosophie`, `Littérature`, `Phrase originale`, `Artist name`.

### Citations d'artistes

Pour une citation d'artiste, utilisez `category: 'Artist name'`, mettez le nom de l'artiste dans `author` et le titre du morceau dans `song`. La citation s'affiche avec un badge musical et un style distinct :

```javascript
{
  text: 'Votre citation.',
  author: 'NOM DE L\'ARTISTE',
  song: 'Titre du morceau',
  category: 'Artist name'
}
```

Le projet ne fournit aucune citation d'artiste : ajoutez uniquement des textes exacts que vous avez le droit d'utiliser. Une courte citation ou une paraphrase reste préférable à la reproduction de paroles.

Vous pouvez modifier la liste `QUOTES`, ou remplir `USER_QUOTES` : si cette liste contient au moins une citation, elle remplace la liste par défaut.

```javascript
var USER_QUOTES = [
  { text: 'Votre citation.', author: 'Auteur réel', category: 'Philosophie' }
];
```

Utilisez uniquement des citations véritables et attribuées correctement.

Une citation change chaque heure. La « Citation du jour » est choisie automatiquement chaque jour, entre 07:00 et 09:00, et signalée par un badge.

## Dépannage

- **Écran noir au démarrage** : l'écran de démarrage dure environ 4 secondes. Patientez ou rechargez la page.
- **Pas de carte Spotify** : vérifiez `CONFIG` dans `script.js` et que Spotify est connecté dans les réglages de Last.fm.
- **Pas de météo** : vérifiez la connexion Internet et les coordonnées.
- **Pas d'actualités** : vérifiez les adresses de `FEEDS` dans `news.js`.
- **Animations lentes** : supprimez l'élément `#ambient-glow` dans `index.html` et son bloc CSS.

## Licence

Usage personnel. Les données proviennent de services tiers (Open-Meteo, Last.fm, rss2json et les éditeurs des flux RSS) soumis à leurs propres conditions.
