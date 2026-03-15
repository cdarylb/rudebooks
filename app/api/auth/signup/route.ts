import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Library from '@/models/Library'
import { SignupSchema } from '@/lib/validators/user'
import { generateInviteCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = SignupSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.flatten() }, { status: 400 })
    }

    await dbConnect()

    const existing = await User.findOne({ email: data.data.email })
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.data.password, 12)

    // — Rejoindre une bibliothèque existante —
    if (data.data.inviteCode) {
      const library = await Library.findOne({
        inviteCode: data.data.inviteCode.trim().toUpperCase(),
      })
      if (!library) {
        return NextResponse.json({ error: 'Code d\'invitation invalide' }, { status: 404 })
      }

      const user = await User.create({
        name: data.data.name,
        email: data.data.email,
        passwordHash,
        libraryId: library._id,
        role: 'member',
      })

      library.members.push({ userId: user._id, role: 'member' })
      await library.save()

      return NextResponse.json({ ok: true }, { status: 201 })
    }

    // — Créer une nouvelle bibliothèque —
    const library = await Library.create({
      name: data.data.libraryName,
      members: [],
      inviteCode: generateInviteCode(),
    })

    const user = await User.create({
      name: data.data.name,
      email: data.data.email,
      passwordHash,
      libraryId: library._id,
      role: 'admin',
    })

    library.members.push({ userId: user._id, role: 'admin' })
    await library.save()

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[signup]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
