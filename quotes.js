// Quote list stored locally. No network required.
// Add your own quotes to USER_QUOTES to replace the built-in list.
// Each entry: { text: '...', author: '...', category: '...' }
// Allowed categories: 'Proverbe français', 'Philosophie', 'Littérature',
// 'Phrase originale', 'Artist name'.
// For 'Artist name', author is the artist and an optional song field gives the title:
// { text: '...', author: 'ARTIST', song: 'Song title', category: 'Artist name' }
// Use only real, verifiable sources.

var QUOTES = [
  {
    text: 'Mieux vaut être seul que mal accompagné.',
    author: 'Proverbe français',
    category: 'Proverbe français'
  },
  {
    text: 'Vouloir, c’est pouvoir.',
    author: 'Proverbe français',
    category: 'Proverbe français'
  },
  {
    text: 'Petit à petit, l’oiseau fait son nid.',
    author: 'Proverbe français',
    category: 'Proverbe français'
  },
  {
    text: 'Qui veut voyager loin ménage sa monture.',
    author: 'Proverbe français',
    category: 'Proverbe français'
  },
  {
    text: 'Rien ne sert de courir ; il faut partir à point.',
    author: 'Jean de La Fontaine',
    category: 'Littérature'
  },
  {
    text: 'Il faut imaginer Sisyphe heureux.',
    author: 'Albert Camus',
    category: 'Philosophie'
  },
  {
    text: 'Le cœur a ses raisons que la raison ne connaît point.',
    author: 'Blaise Pascal',
    category: 'Philosophie'
  },
  {
    text: 'Il faut cultiver notre jardin.',
    author: 'Voltaire',
    category: 'Littérature'
  },
  {
    text: 'Ce que l’on conçoit bien s’énonce clairement.',
    author: 'Nicolas Boileau',
    category: 'Littérature'
  }
];

// Personal quotes. When not empty, these replace QUOTES.
var USER_QUOTES = QUOTES.concat([
  {
    text: "Mieux vaut être seul que mal accompagné.",
    author: "Proverbe français",
    category: "Proverbe français"
  },
  {
    text: "Petit à petit, l'oiseau fait son nid.",
    author: "Proverbe français",
    category: "Proverbe français"
  },
  {
    text: "Qui veut voyager loin ménage sa monture.",
    author: "Proverbe français",
    category: "Proverbe français"
  },
  {
    text: "Vouloir, c'est pouvoir.",
    author: "Proverbe français",
    category: "Proverbe français"
  },
  {
    text: "Après la pluie vient le beau temps.",
    author: "Proverbe français",
    category: "Proverbe français"
  },
  {
    text: "La patience est mère de toutes les vertus.",
    author: "Proverbe français",
    category: "Proverbe français"
  },
  {
    text: "Rien ne sert de courir, il faut partir à point.",
    author: "Jean de La Fontaine",
    category: "Littérature"
  },
  {
    text: "Le cœur a ses raisons que la raison ne connaît point.",
    author: "Blaise Pascal",
    category: "Philosophie"
  },
  {
    text: "Il faut imaginer Sisyphe heureux.",
    author: "Albert Camus",
    category: "Philosophie"
  },
  {
    text: "La vraie générosité envers l'avenir consiste à tout donner au présent.",
    author: "Albert Camus",
    category: "Philosophie"
  },
  {
    text: "L'homme est condamné à être libre.",
    author: "Jean-Paul Sartre",
    category: "Philosophie"
  },
  {
    text: "Connais-toi toi-même.",
    author: "Socrate",
    category: "Philosophie"
  },
  {
    text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
    author: "Sénèque",
    category: "Philosophie"
  },
  {
    text: "La difficulté montre ce que les hommes sont.",
    author: "Épictète",
    category: "Philosophie"
  },
  {
    text: "Notre vie est ce que nos pensées en font.",
    author: "Marc Aurèle",
    category: "Philosophie"
  },
  {
    text: "Le bonheur de ta vie dépend de la qualité de tes pensées.",
    author: "Marc Aurèle",
    category: "Philosophie"
  },
  {
    text: "Fais de ta vie un rêve, et d'un rêve une réalité.",
    author: "Antoine de Saint-Exupéry",
    category: "Littérature"
  },
  {
    text: "On ne voit bien qu'avec le cœur.",
    author: "Antoine de Saint-Exupéry",
    category: "Littérature"
  },
  {
    text: "La liberté commence où l'ignorance finit.",
    author: "Victor Hugo",
    category: "Littérature"
  },
  {
    text: "Même la nuit la plus sombre prendra fin.",
    author: "Victor Hugo",
    category: "Littérature"
  },
  {
    text: "L'avenir est une porte, le passé en est la clé.",
    author: "Victor Hugo",
    category: "Littérature"
  },
  {
    text: "Les grandes pensées viennent du cœur.",
    author: "Vauvenargues",
    category: "Philosophie"
  },
  {
    text: "Le temps découvre les secrets.",
    author: "Proverbe français",
    category: "Proverbe français"
  },
  {
    text: "Chaque jour compte.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "La régularité finit par dépasser le talent qui se repose.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le silence protège les projets qui ne sont pas encore prêts.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Avancer lentement reste avancer.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "La discipline construit ce que la motivation commence.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le progrès n'est pas spectaculaire, il est quotidien.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Un petit effort répété cent fois devient une force.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Les résultats aiment ceux qui restent constants.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le succès pousse souvent derrière des portes fermées.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Les excuses construisent peu, les habitudes construisent tout.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "La patience est une force.",
    author: "Auteur inconnu",
    category: "Phrase originale"
  },
  {
    text: "Avance discrètement, laisse les résultats parler.",
    author: "Auteur inconnu",
    category: "Phrase originale"
  },
  {
    text: "Le plus malin n'est pas celui qui parle, mais celui qui agit.",
    author: "Auteur inconnu",
    category: "Phrase originale"
  },
  {
    text: "Ce n'est pas la vitesse qui compte, c'est la constance.",
    author: "Auteur inconnu",
    category: "Phrase originale"
  },
  {
    text: "Une montagne se gravit pas à pas.",
    author: "Proverbe",
    category: "Proverbe français"
  },
  {
    text: "Celui qui maîtrise son temps maîtrise sa vie.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "L'échec est un professeur sévère mais efficace.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le courage commence souvent dans le silence.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Ce que tu répètes devient ce que tu es.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "La meilleure décision est parfois la plus simple.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Les grandes réussites naissent de petites actions répétées.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le futur récompense rarement l'impatience.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Reste concentré sur la route, pas sur le bruit.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le doute ralentit, l'action éclaire.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le temps passe de toute façon, autant l'utiliser.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "L'ambition est utile lorsqu'elle reste au service du travail.",
    author: "Phrase originale",
    category: "Phrase originale"
  },
  {
    text: "Le vrai raccourci est souvent la persévérance.",
    author: "Phrase originale",
    category: "Phrase originale"
  }
]);
