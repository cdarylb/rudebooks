import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  avatar?: string
  libraryId: mongoose.Types.ObjectId
  role: 'admin' | 'member'
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)

export default User
