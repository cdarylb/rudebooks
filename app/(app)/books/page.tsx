import Link from 'next/link'
import { Plus } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import BookList from '@/components/books/BookList'

export default function BooksPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Bibliothèque"
        action={
          <Link
            href="/books/add?tab=scan"
            className="flex items-center gap-1.5 gradient-primary text-white text-sm font-medium px-3 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={16} />
            Ajouter
          </Link>
        }
      />
      <BookList />
    </div>
  )
}
