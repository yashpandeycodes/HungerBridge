import { z } from 'zod';

export const donationSchema = z.object({
  foodCategory: z.string().min(1, "Food category is required"),
  quantity: z.string().min(1, "Quantity is required"),
  expiryTime: z.string().datetime({ message: "Invalid date format" }), 
  pickupLocation: z.string().min(5, "Please provide a complete pickup address"),
  isUrgent: z.boolean().optional(),
});