import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import '@/models/Location'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  void req
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const libraryId = (session.user as { libraryId: string }).libraryId

  const books = await Book.find({ libraryId })
    .populate('locationId', 'name')
    .sort({ createdAt: -1 })
    .lean()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = books.map((b: any) => ({
    Titre: b.title ?? '',
    Auteurs: (b.authors ?? []).join(', '),
    ISBN: b.isbn ?? '',
    ISBN13: b.isbn13 ?? '',
    Éditeur: b.publisher ?? '',
    'Année de publication': b.publishedYear ?? '',
    'Nombre de pages': b.pageCount ?? '',
    Genres: (b.genres ?? []).join(', '),
    Emplacement: b.locationId?.name ?? '',
    'Note emplacement': b.locationNote ?? '',
    Favori: b.favorite ? 'Oui' : 'Non',
    Description: b.description ?? '',
    'Date d\'ajout': b.createdAt ? new Date(b.createdAt).toLocaleDateString('fr-FR') : '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Livres')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="bibliotheque.xlsx"',
    },
  })
}
