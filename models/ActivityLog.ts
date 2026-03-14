import mongoose, { Schema, Document, Model } from 'mongoose'

type ActionType =
  | 'add_book'
  | 'remove_book'
  | 'move_book'
  | 'lend_book'
  | 'return_book'
  | 'add_wishlist'
  | 'remove_wishlist'
  | 'purchase_wishlist'
  | 'add_location'
  | 'remove_location'
  | 'invite_user'

export interface IActivityLog extends Document {
  libraryId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  action: ActionType
  entityType: 'book' | 'wishlistItem' | 'location' | 'user'
  entityId: mongoose.Types.ObjectId
  metadata?: Record<string, unknown>
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

ActivityLogSchema.index({ libraryId: 1, createdAt: -1 })
ActivityLogSchema.index({ userId: 1, createdAt: -1 })

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ??
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

export default ActivityLog
