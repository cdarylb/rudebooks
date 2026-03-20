import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { normalizeIsbn } from '@/lib/utils'
import { fetchGoogleBooksPrice, fetchAmazonPrice } from '@/lib/price'

type Params = { params: { isbn: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isbn = normalizeIsbn(params.isbn)
  const source = new URL(req.url).searchParams.get('source') ?? 'google'

  const price = source === 'amazon'
    ? await fetchAmazonPrice(isbn)
    : await fetchGoogleBooksPrice(isbn)

  const sourceName = source === 'amazon' ? 'Amazon' : 'Google Books'
  if (price === null) return NextResponse.json({ error: `Prix introuvable sur ${sourceName}` }, { status: 404 })

  return NextResponse.json({ price, source: sourceName })
}
