'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import BookForm from '@/components/books/BookForm'
import { BookInput } from '@/lib/validators/book'

export default function EditBookPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [initialData, setInitialData] = useState<Partial<BookInput> | null>(null)

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then((r) => r.json())
      .then((book) => {
        setInitialData({
          title:        book.title,
          authors:      book.authors,
          isbn:         book.isbn ?? '',
          cover:        book.cover ?? '',
          description:  book.description ?? '',
          publisher:    book.publisher ?? '',
          publishedYear: book.publishedYear,
          pageCount:    book.pageCount,
          genres:       book.genres ?? [],
          locationId:   book.locationId?._id ?? book.locationId ?? '',
          locationNote: book.locationNote ?? '',
        })
      })
  }, [id])

  async function handleSubmit(data: BookInput) {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.push(`/books/${id}`)
  }

  if (!initialData) {
    return (
      <div className="space-y-4">
        <PageHeader title="Modifier le livre" backHref={`/books/${id}`} />
        <div className="flex justify-center py-12 text-ink-muted text-sm">Chargement…</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Modifier le livre" backHref={`/books/${id}`} />
      <BookForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Enregistrer" />
    </div>
  )
}
