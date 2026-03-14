import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBook extends Document {
  libraryId: mongoose.Types.ObjectId
  title: string
  authors: string[]
  isbn?: string
  isbn13?: string
  cover?: string
  description?: string
  publisher?: string
  publishedYear?: number
  pageCount?: number
  language?: string
  genres?: string[]
  locationId?: mongoose.Types.ObjectId
  locationNote?: string
  status: 'owned' | 'lent'
  lentTo?: string
  lentAt?: Date
  addedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const BookSchema = new Schema<IBook>(
  {
    libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
    title: { type: String, required: true, trim: true },
    authors: [{ type: String, trim: true }],
    isbn: { type: String, trim: true, sparse: true },
    isbn13: { type: String, trim: true, sparse: true },
    cover: { type: String },
    description: { type: String },
    publisher: { type: String, trim: true },
    publishedYear: { type: Number },
    pageCount: { type: Number },
    language: { type: String },
    genres: [{ type: String }],
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
    locationNote: { type: String, trim: true },
    status: { type: String, enum: ['owned', 'lent'], default: 'owned' },
    lentTo: { type: String, trim: true },
    lentAt: { type: Date },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// Indexes
BookSchema.index({ libraryId: 1, createdAt: -1 })
BookSchema.index({ libraryId: 1, locationId: 1 })
BookSchema.index({ title: 'text', authors: 'text', isbn: 'text', isbn13: 'text' })

const Book: Model<IBook> =
  mongoose.models.Book ?? mongoose.model<IBook>('Book', BookSchema)

export default Book
