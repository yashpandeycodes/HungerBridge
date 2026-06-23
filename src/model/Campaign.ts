import mongoose, { Schema, Document } from 'mongoose';

export interface Campaign extends Document {
  ngoId: mongoose.Types.ObjectId;
  title: string;
  description: string; // GenAI will help generate this
  targetMeals: number;
  mealsCollected: number;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: Date;
}

const CampaignSchema: Schema<Campaign> = new Schema({
  ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetMeals: { type: Number, required: true },
  mealsCollected: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
});

const CampaignModel = mongoose.models.Campaign || mongoose.model<Campaign>('Campaign', CampaignSchema);
export default CampaignModel;