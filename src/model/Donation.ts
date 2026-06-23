import mongoose, { Schema, Document } from 'mongoose';

export interface Donation extends Document {
  donorId: mongoose.Types.ObjectId;
  foodCategory: string;
  quantity: string;
  expiryTime: Date;
  pickupLocation: string;
  photoUrl?: string;
  isUrgent: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'ASSIGNED' | 'COMPLETED';
  ngoId?: mongoose.Types.ObjectId;
  volunteerId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DonationSchema: Schema<Donation> = new Schema({
  donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  foodCategory: { type: String, required: true },
  quantity: { type: String, required: true },
  expiryTime: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  photoUrl: { type: String },
  isUrgent: { type: Boolean, default: false },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'ASSIGNED', 'COMPLETED'], default: 'PENDING' },
  ngoId: { type: Schema.Types.ObjectId, ref: 'User' },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User' },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  createdAt: { type: Date, default: Date.now },
});

const DonationModel = mongoose.models.Donation || mongoose.model<Donation>('Donation', DonationSchema);
export default DonationModel;