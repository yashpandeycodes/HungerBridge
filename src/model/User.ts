import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER';
  phone?: string;
  location?: string;
  isVerified: boolean;
  createdAt: Date;
}

const UserSchema: Schema<User> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional if using OAuth later
  role: { type: String, enum: ['DONOR', 'NGO', 'VOLUNTEER'], required: true },
  phone: { type: String },
  location: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.models.User || mongoose.model<User>('User', UserSchema);
export default UserModel;