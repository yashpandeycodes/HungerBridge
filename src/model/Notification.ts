import mongoose, { Schema, Document } from 'mongoose';

export interface Notification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<Notification> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], default: 'INFO' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.models.Notification || mongoose.model<Notification>('Notification', NotificationSchema);
export default NotificationModel;
