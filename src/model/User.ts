import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER';
  phone?: string;
  ngoRegistrationNumber?: string;
  location?: string;
  verifyCode: string;
  verifyCodeExpiry: Date; 
  isVerified: boolean;
  karma: number;
  deliveries: number;
  createdAt: Date;
}

const UserSchema: Schema<User> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: [true,'Email is required'], unique: true },
  password: { type: String , required: [true, 'Password is required'],}, 
  role: { type: String, enum: ['DONOR', 'NGO', 'VOLUNTEER'], required: true },
  phone: { type: String },
  ngoRegistrationNumber: { type: String },
  location: { type: String },
   verifyCode: {
    type: String,
    required: [true, 'Verify Code is required'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify Code Expiry is required'],
  },
  isVerified: { type: Boolean, default: false },
  karma: { type: Number, default: 0 },
  deliveries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.models.User || mongoose.model<User>('User', UserSchema);
export default UserModel;