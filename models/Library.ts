import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ILibraryMember {
  userId: mongoose.Types.ObjectId
  role: 'admin' | 'member'
}

export interface ILibrary extends Document {
  name: string
  members: ILibraryMember[]
  inviteCode: string
  settings: {
    defaultCurrency: string
    timezone: string
  }
  createdAt: Date
}

const LibrarySchema = new Schema<ILibrary>(
  {
    name: { type: String, required: true, trim: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
      },
    ],
    inviteCode: { type: String, required: true, unique: true },
    settings: {
      defaultCurrency: { type: String, default: 'EUR' },
      timezone: { type: String, default: 'Europe/Paris' },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Library: Model<ILibrary> =
  mongoose.models.Library ?? mongoose.model<ILibrary>('Library', LibrarySchema)

export default Library
