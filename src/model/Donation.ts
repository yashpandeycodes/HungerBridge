import mongoose, { Schema, Document } from 'mongoose';

export interface Donation extends Document {
  donorId: mongoose.Types.ObjectId;
  foodCategory: string;
  foodSource: string;
  quantity: string;
  expiryTime: Date;
  pickupLocation: string;
  photoUrl?: string;
  isUrgent: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'ASSIGNED' | 'COMPLETED' | 'EXPIRED';
  trustScore:number;
  isSuspicious:boolean;
  coordinates?: { lat: number; lng: number };
  ngoId?: mongoose.Types.ObjectId;
  volunteerId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  createdAt: Date;
  acceptedAt?: Date;
}

const DonationSchema: Schema<Donation> = new Schema({
  donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  foodCategory: { type: String, required: true },
  foodSource: { type: String, required: true },
  quantity: { type: String, required: true },
  expiryTime: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  photoUrl: { type: String },
  isUrgent: { type: Boolean, default: false },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'ASSIGNED', 'COMPLETED', 'EXPIRED'], default: 'PENDING' },
  ngoId: { type: Schema.Types.ObjectId, ref: 'User' },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User' },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  trustScore: {
    type: Number,
    default: 95
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
});

const DonationModel = mongoose.models.Donation || mongoose.model<Donation>('Donation', DonationSchema);
export default DonationModel;