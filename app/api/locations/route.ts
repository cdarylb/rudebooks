import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Location from '@/models/Location'
import { z } from 'zod'

const LocationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  parentId: z.string().optional(),
})

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId

  const locations = await Location.find({ libraryId })
    .populate('parentId', 'name')
    .sort({ name: 1 })
    .lean()

  return NextResponse.json(locations)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role: string }).role
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const data = LocationSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.flatten() }, { status: 400 })
    }

    await dbConnect()
    const libraryId = (session.user as { libraryId: string }).libraryId

    const location = await Location.create({ ...data.data, libraryId })
    return NextResponse.json(location, { status: 201 })
  } catch (err) {
    console.error('[locations POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
