import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Library from '@/models/Library'
import User from '@/models/User'

type Params = { params: { userId: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { libraryId: string; id: string; role: string }
  if (sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (params.userId === sessionUser.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }

  await dbConnect()

  const library = await Library.findById(sessionUser.libraryId)
  if (!library) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  library.members = library.members.filter(
    (m) => m.userId.toString() !== params.userId
  )
  await library.save()

  // Optionally reset user's libraryId — for now just remove from members
  await User.findByIdAndDelete(params.userId)

  return NextResponse.json({ ok: true })
}
