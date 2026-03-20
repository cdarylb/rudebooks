import { load } from 'cheerio'

function isbn13ToIsbn10(isbn13: string): string | null {
  if (isbn13.length !== 13 || !isbn13.startsWith('978')) return null
  const core = isbn13.slice(3, 12)
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(core[i]) * (10 - i)
  const check = (11 - (sum % 11)) % 11
  return core + (check === 10 ? 'X' : String(check))
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

export async function fetchFnacPrice(isbn: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${isbn}&sft=1&sa=0`,
      { headers: HEADERS }
    )
    if (!res.ok) return null

    const html = await res.text()
    const $ = load(html)

    const selectors = [
      '.f-priceBox-price',
      '.userPrice',
      '.Article-item .f-priceBox',
      '.js-article-list .f-priceBox-price',
    ]
    for (const sel of selectors) {
      const raw = $(sel).first().text().trim()
      const m = raw.match(/([\d]+[.,][\d]{2})/)
      if (m) return parseFloat(m[1].replace(',', '.'))
    }

    // Attribut data-price parfois présent
    const dataPrice = $('[data-main-price]').first().attr('data-main-price')
    if (dataPrice) {
      const p = parseFloat(dataPrice.replace(',', '.'))
      if (!isNaN(p)) return p
    }
  } catch { /* skip */ }
  return null
}

export async function fetchAmazonPrice(isbn: string): Promise<number | null> {
  const asin = isbn.length === 13 ? isbn13ToIsbn10(isbn) : isbn
  if (!asin) return null

  try {
    const res = await fetch(`https://www.amazon.fr/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) return null

    const html = await res.text()
    const $ = load(html)

    if ($('form[action="/errors/validateCaptcha"]').length > 0) return null

    const selectors = [
      '#price',
      '#newBuyBoxPrice',
      '.buybox-tabpanel .a-price .a-offscreen',
      '#buyNewSection .a-price .a-offscreen',
      '.a-price.priceToPay .a-offscreen',
    ]
    for (const sel of selectors) {
      const raw = $(sel).first().text().trim()
      const m = raw.match(/([\d]+[.,][\d]{2})/)
      if (m) return parseFloat(m[1].replace(',', '.'))
    }
  } catch { /* skip */ }
  return null
}

export async function fetchGoogleBooksPrice(isbn: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
    )
    if (!res.ok) return null

    const json = await res.json()
    const saleInfo = json.items?.[0]?.saleInfo
    if (!saleInfo || saleInfo.saleability === 'NOT_FOR_SALE') return null

    const amount =
      saleInfo.retailPrice?.amount ??
      saleInfo.listPrice?.amount ??
      null

    const currency = saleInfo.retailPrice?.currencyCode ?? saleInfo.listPrice?.currencyCode
    if (typeof amount === 'number' && currency === 'EUR') return amount
  } catch { /* skip */ }
  return null
}

/** Google Books → Amazon → Fnac */
export async function fetchPrice(isbn: string): Promise<number | null> {
  const google = await fetchGoogleBooksPrice(isbn)
  if (google !== null) return google

  const amazon = await fetchAmazonPrice(isbn)
  if (amazon !== null) return amazon

  return fetchFnacPrice(isbn)
}
