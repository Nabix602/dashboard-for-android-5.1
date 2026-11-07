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
var USER_QUOTES = [];
