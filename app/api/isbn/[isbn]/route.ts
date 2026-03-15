import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { normalizeIsbn } from '@/lib/utils'
import { mapGenres } from '@/lib/genres'
import { load } from 'cheerio'

type Params = { params: { isbn: string } }

interface BookData {
  title: string
  authors: string[]
  isbn: string
  cover: string
  publisher?: string
  publishedYear?: number
  pageCount?: number
  genres?: string[]
  description?: string
}

// ── Amazon ────────────────────────────────────────────────────────────────────

function isbn13ToIsbn10(isbn13: string): string | null {
  if (isbn13.length !== 13 || !isbn13.startsWith('978')) return null
  const core = isbn13.slice(3, 12)
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(core[i]) * (10 - i)
  const check = (11 - (sum % 11)) % 11
  return core + (check === 10 ? 'X' : String(check))
}

async function fetchAmazon(isbn: string): Promise<BookData | null> {
  const asin = isbn.length === 13 ? isbn13ToIsbn10(isbn) : isbn
  if (!asin) return null

  const res = await fetch(`https://www.amazon.fr/dp/${asin}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })
  if (!res.ok) return null

  const html = await res.text()
  const $ = load(html)

  const title = $('#productTitle').text().trim()
  if (!title) return null  // CAPTCHA ou page vide

  // Auteurs
  const authors: string[] = []
  $('#bylineInfo .author .a-link-normal, #bylineInfo .contributorNameID').each((_, el) => {
    const name = $(el).text().trim()
    if (name && !authors.includes(name)) authors.push(name)
  })

  // Couverture
  const cover =
    $('#landingImage').attr('src') ||
    $('#imgTagWrapperId img').first().attr('src') ||
    ''

  // Détails (éditeur, date, pages)
  let publisher: string | undefined
  let publishedYear: number | undefined
  let pageCount: number | undefined

  $('#detailBullets_feature_div li span.a-list-item').each((_, el) => {
    const text = $(el).text().replace(/\u200f|\u200e/g, '').replace(/\s+/g, ' ').trim()
    if (/éditeur/i.test(text)) {
      const m = text.match(/:\s*([^;(]+)/)
      if (m) publisher = m[1].trim()
    }
    if (/pages/i.test(text)) {
      const m = text.match(/(\d+)\s*pages/i)
      if (m) pageCount = parseInt(m[1])
    }
    if (/date de parution|publication/i.test(text)) {
      const m = text.match(/(\d{4})/)
      if (m) publishedYear = parseInt(m[1])
    }
  })

  // Description
  const description =
    $('#bookDescription_feature_div .a-expander-content p').map((_, el) => $(el).text().trim()).get().join('\n').trim() ||
    $('#productDescription p').text().trim() ||
    undefined

  return { title, authors, isbn, cover, publisher, publishedYear, pageCount, description }
}

// ── Google Books ──────────────────────────────────────────────────────────────

interface GoogleBooksVolume {
  totalItems: number
  items?: Array<{
    volumeInfo: {
      title?: string
      authors?: string[]
      publisher?: string
      publishedDate?: string
      description?: string
      pageCount?: number
      categories?: string[]

      industryIdentifiers?: Array<{ type: string; identifier: string }>
      imageLinks?: { thumbnail?: string; smallThumbnail?: string }
    }
  }>
}

async function fetchGoogleBooks(isbn: string): Promise<BookData | null> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
  )
  if (!res.ok) return null

  const json: GoogleBooksVolume = await res.json()
  if (!json.items?.length) return null

  const info = json.items[0].volumeInfo
  const publishedYear = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4)) : undefined
  const rawCover = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail
  const cover = rawCover?.replace('http://', 'https://').replace('zoom=1', 'zoom=0') ?? ''

  return {
    title: info.title ?? '',
    authors: info.authors?.length ? info.authors : [],
    isbn,
    cover,
    publisher: info.publisher,
    publishedYear: publishedYear && !isNaN(publishedYear) ? publishedYear : undefined,
    pageCount: info.pageCount,

    genres: info.categories ? mapGenres(info.categories) : [],
    description: info.description,
  }
}

// ── Open Library ──────────────────────────────────────────────────────────────

interface OpenLibraryEdition {
  title?: string
  authors?: Array<{ key: string }>
  publishers?: string[]
  publish_date?: string
  number_of_pages?: number
  languages?: Array<{ key: string }>
  subjects?: string[]
  description?: string | { value: string }
  covers?: number[]
}

interface OpenLibraryWork {
  title?: string
  description?: string | { value: string }
  subjects?: string[]
}

interface OpenLibraryAuthor {
  name?: string
}

async function fetchOpenLibrary(isbn: string): Promise<BookData | null> {
  const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`)
  if (!res.ok) return null

  const edition: OpenLibraryEdition = await res.json()
  if (!edition.title) return null

  // Resolve author names
  const authors: string[] = []
  if (edition.authors?.length) {
    await Promise.all(
      edition.authors.map(async (a) => {
        try {
          const r = await fetch(`https://openlibrary.org${a.key}.json`)
          if (r.ok) {
            const author: OpenLibraryAuthor = await r.json()
            if (author.name) authors.push(author.name)
          }
        } catch { /* skip */ }
      })
    )
  }

  // Cover
  const cover = edition.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${edition.covers[0]}-L.jpg`
    : ''

  // Year
  const publishedYear = edition.publish_date
    ? parseInt(edition.publish_date.replace(/\D/g, '').slice(0, 4))
    : undefined

// Description
  const rawDesc = edition.description
  const description = typeof rawDesc === 'string'
    ? rawDesc
    : rawDesc?.value

  // Work-level subjects/description fallback
  let genres: string[] | undefined
  let workDescription = description
  if (!genres || !description) {
    try {
      // Find work key from edition (not always present — skip if absent)
      const editionAny = edition as Record<string, unknown>
      const workKey = (editionAny.works as Array<{ key: string }>)?.[0]?.key
      if (workKey) {
        const wr = await fetch(`https://openlibrary.org${workKey}.json`)
        if (wr.ok) {
          const work: OpenLibraryWork = await wr.json()
          genres = work.subjects ? mapGenres(work.subjects) : undefined
          if (!workDescription) {
            const d = work.description
            workDescription = typeof d === 'string' ? d : d?.value
          }
        }
      }
    } catch { /* skip */ }
  }

  return {
    title: edition.title,
    authors,
    isbn,
    cover,
    publisher: edition.publishers?.[0],
    publishedYear: publishedYear && !isNaN(publishedYear) ? publishedYear : undefined,
    pageCount: edition.number_of_pages,
    genres,
    description: workDescription,
  }
}

// ── Merge ─────────────────────────────────────────────────────────────────────

function merge(primary: BookData | null, secondary: BookData | null): BookData | null {
  if (!primary && !secondary) return null
  if (!primary) return secondary
  if (!secondary) return primary
  return {
    title:        primary.title        || secondary.title,
    authors:      primary.authors?.length ? primary.authors : secondary.authors,
    isbn:         primary.isbn         || secondary.isbn,
    cover:        primary.cover        || secondary.cover,
    publisher:    primary.publisher    ?? secondary.publisher,
    publishedYear: primary.publishedYear ?? secondary.publishedYear,
    pageCount:    primary.pageCount    ?? secondary.pageCount,
    genres:       primary.genres?.length ? primary.genres : secondary.genres,
    description:  primary.description  ?? secondary.description,
  }
}

// ── Cover fallbacks ───────────────────────────────────────────────────────────

// Vérifie si une URL image existe (HEAD request, Content-Length > 500 pour éviter les placeholders)
async function imageExists(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    if (!r.ok) return false
    const len = parseInt(r.headers.get('content-length') ?? '0')
    return len > 500
  } catch { return false }
}

async function findCover(isbn: string): Promise<string> {
  const candidates = [
    // Open Library direct ISBN (L = large)
    `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
    // Open Library medium si large absent
    `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
  ]
  for (const url of candidates) {
    if (await imageExists(url)) return url
  }
  return ''
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isbn = normalizeIsbn(params.isbn)

  try {
    const [amazon, google, openlib] = await Promise.allSettled([
      fetchAmazon(isbn),
      fetchGoogleBooks(isbn),
      fetchOpenLibrary(isbn),
    ])

    const amazonData  = amazon.status  === 'fulfilled' ? amazon.value  : null
    const googleData  = google.status  === 'fulfilled' ? google.value  : null
    const openlibData = openlib.status === 'fulfilled' ? openlib.value : null

    const data = merge(merge(amazonData, googleData), openlibData)

    if (!data) return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 })

    // Fallback couverture si aucune API n'en a fourni
    if (!data.cover) {
      data.cover = await findCover(isbn)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[isbn lookup]', err)
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 502 })
  }
}
