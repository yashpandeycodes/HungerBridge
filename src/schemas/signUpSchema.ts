import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email({ message: 'Invalid email address'}),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['DONOR', 'NGO', 'VOLUNTEER']),
  phone: z.string().optional(),
  ngoRegistrationNumber: z.string().optional(),
});