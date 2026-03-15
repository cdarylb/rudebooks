import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReadingList extends Document {
  userId: mongoose.Types.ObjectId
  bookId: mongoose.Types.ObjectId
  libraryId: mongoose.Types.ObjectId
  addedAt: Date
}

const ReadingListSchema = new Schema<IReadingList>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  bookId:    { type: Schema.Types.ObjectId, ref: 'Book',    required: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  addedAt:   { type: Date, default: Date.now },
})

ReadingListSchema.index({ userId: 1, bookId: 1 }, { unique: true })
ReadingListSchema.index({ userId: 1, libraryId: 1, addedAt: -1 })

const ReadingList: Model<IReadingList> =
  mongoose.models.ReadingList ?? mongoose.model<IReadingList>('ReadingList', ReadingListSchema)

export default ReadingList
