import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWishlistItem extends Document {
  libraryId: mongoose.Types.ObjectId
  title: string
  authors?: string[]
  isbn?: string
  cover?: string
  description?: string
  sourceUrl?: string
  price?: number
  currency?: string
  priority: 'low' | 'medium' | 'high'
  status: 'wanted' | 'purchased'
  addedBy: mongoose.Types.ObjectId
  notes?: string
  createdAt: Date
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
    title: { type: String, required: true, trim: true },
    authors: [{ type: String, trim: true }],
    isbn: { type: String, trim: true },
    cover: { type: String },
    description: { type: String },
    sourceUrl: { type: String },
    price: { type: Number },
    currency: { type: String, default: 'EUR' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['wanted', 'purchased'], default: 'wanted' },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

WishlistItemSchema.index({ libraryId: 1, status: 1, createdAt: -1 })

const WishlistItem: Model<IWishlistItem> =
  mongoose.models.WishlistItem ??
  mongoose.model<IWishlistItem>('WishlistItem', WishlistItemSchema)

export default WishlistItem
