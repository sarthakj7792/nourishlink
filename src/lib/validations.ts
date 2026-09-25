import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['DONOR', 'RECIPIENT', 'ADMIN']),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const donationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.enum(['PRODUCE', 'BAKERY', 'DAIRY', 'CANNED', 'PREPARED', 'BEVERAGES', 'OTHER']),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.enum(['KG', 'LBS', 'ITEMS', 'BOXES']),
  perishableDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid expiry/best-by date is required',
  }),
  storageReq: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']),
  foodBankId: z.string().optional().nullable(),
  dietaryTags: z.array(z.string()).optional(),
  pickupAddress: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
});

export const requestSchema = z.object({
  householdSize: z.number().int().min(1, 'Household size must be at least 1'),
  dietaryRequirements: z.array(z.string()).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
  foodBankId: z.string().optional().nullable(),
  specialNotes: z.string().optional(),
});
