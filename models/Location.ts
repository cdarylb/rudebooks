import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ILocation extends Document {
  libraryId: mongoose.Types.ObjectId
  name: string
  description?: string
  parentId?: mongoose.Types.ObjectId
  createdAt: Date
}

const LocationSchema = new Schema<ILocation>(
  {
    libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Location: Model<ILocation> =
  mongoose.models.Location ?? mongoose.model<ILocation>('Location', LocationSchema)

export default Location
