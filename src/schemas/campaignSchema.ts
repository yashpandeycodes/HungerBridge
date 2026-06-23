
import { z } from 'zod';

export const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description is required"),
  targetMeals: z.coerce.number().min(1, "Target meals must be at least 1"),
});