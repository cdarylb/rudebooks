export const GENRES = [
  'Roman',
  'Poésie',
  'Théâtre',
  'Essai',
  'SF / Fantasy',
  'Policier',
  'Roman historique',
  'Histoire',
  'Philosophie',
  'Sciences',
  'Psychologie',
  'Biographie',
  'Art',
  'Photographie',
  'Architecture',
  'Musique',
  'Design',
  'Cuisine',
  'Voyage',
  'Santé / bien-être',
  'Technologie',
  'Management',
  'Marketing',
  'DIY',
  'Bande dessinée',
  'Manga / Comics',
  'Roman graphique',
  'Jeunesse',
] as const

export type Genre = typeof GENRES[number]

// Mapping des catégories Google Books / Open Library → genres normalisés
const GENRE_MAP: Record<string, Genre> = {
  'fiction':               'Roman',
  'theater':               'Théâtre',
  'theatre':               'Théâtre',
  'drama':                 'Théâtre',
  'essay':                 'Essai',
  'essays':                'Essai',
  'juvenile fiction':      'Jeunesse',
  'juvenile nonfiction':   'Jeunesse',
  'children':              'Jeunesse',
  'young adult':           'Jeunesse',
  'science fiction':       'SF / Fantasy',
  'science-fiction':       'SF / Fantasy',
  'fantasy':               'SF / Fantasy',
  'mystery':               'Policier',
  'thriller':              'Policier',
  'crime':                 'Policier',
  'detective':             'Policier',
  'historical fiction':    'Roman historique',
  'historical':            'Roman historique',
  'history':               'Histoire',
  'philosophy':            'Philosophie',
  'science':               'Sciences',
  'sciences':              'Sciences',
  'psychology':            'Psychologie',
  'biography':             'Biographie',
  'autobiography':         'Biographie',
  'memoir':                'Biographie',
  'art':                   'Art',
  'photography':           'Photographie',
  'architecture':          'Architecture',
  'music':                 'Musique',
  'design':                'Design',
  'cooking':               'Cuisine',
  'food':                  'Cuisine',
  'travel':                'Voyage',
  'health':                'Santé / bien-être',
  'computers':             'Technologie',
  'computer science':      'Technologie',
  'programming':           'Technologie',
  'software':              'Technologie',
  'technology':            'Technologie',
  'business':              'Management',
  'management':            'Management',
  'marketing':             'Marketing',
  'economics':             'Management',
  'comics':                'Manga / Comics',
  'comic books':           'Manga / Comics',
  'bandes dessinées':      'Bande dessinée',
  'manga':                 'Manga / Comics',
  'graphic novel':         'Roman graphique',
  'graphic novels':        'Roman graphique',
}

export function mapGenres(raw: string[]): Genre[] {
  const result = new Set<Genre>()
  for (const g of raw) {
    const key = g.toLowerCase().trim()
    // Correspondance exacte
    if (GENRE_MAP[key]) { result.add(GENRE_MAP[key]); continue }
    // Correspondance partielle
    for (const [pattern, genre] of Object.entries(GENRE_MAP)) {
      if (key.includes(pattern) || pattern.includes(key)) {
        result.add(genre)
        break
      }
    }
  }
  return Array.from(result)
}
