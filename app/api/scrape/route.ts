import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 RudeBooks/1.0' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 502 })
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    // Extract Open Graph / meta tags
    const og = (property: string) =>
      $(`meta[property="og:${property}"]`).attr('content') ??
      $(`meta[name="og:${property}"]`).attr('content') ??
      ''

    const meta = (name: string) => $(`meta[name="${name}"]`).attr('content') ?? ''

    const title =
      og('title') ||
      $('h1').first().text().trim() ||
      $('title').text().trim()

    const cover = og('image') || ''
    const description = og('description') || meta('description') || ''

    // Try to extract price
    const priceText =
      $('[class*="price"]').first().text().trim() ||
      $('[itemprop="price"]').attr('content') ||
      ''
    const priceMatch = priceText.match(/[\d]+[.,][\d]{2}/)
    const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : undefined

    // ISBN from page
    const isbnMatch = html.match(/(?:ISBN[-:]?\s*)?(97[89][\d\-]{10,17}|\d{9}[\dXx])/i)
    const isbn = isbnMatch ? isbnMatch[1].replace(/[-\s]/g, '') : undefined

    return NextResponse.json({
      title,
      cover,
      description,
      price,
      isbn,
      sourceUrl: url,
    })
  } catch (err) {
    console.error('[scrape]', err)
    return NextResponse.json({ error: 'Scrape failed' }, { status: 500 })
  }
}
