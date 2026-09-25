import { describe, it, expect } from 'vitest';
import { donationSchema, requestSchema, registerSchema } from '@/lib/validations';

describe('Validation Schemas (Zod)', () => {
  it('validates correct donation payloads', () => {
    const validDonation = {
      title: 'Fresh Broccoli',
      category: 'PRODUCE',
      quantity: 15,
      unit: 'KG',
      perishableDate: new Date().toISOString(),
      storageReq: 'REFRIGERATED',
    };
    const result = donationSchema.safeParse(validDonation);
    expect(result.success).toBe(true);
  });

  it('rejects invalid donation payloads with negative quantity', () => {
    const invalidDonation = {
      title: 'Bad Quantity Item',
      category: 'PRODUCE',
      quantity: -5,
      unit: 'KG',
      perishableDate: new Date().toISOString(),
      storageReq: 'REFRIGERATED',
    };
    const result = donationSchema.safeParse(invalidDonation);
    expect(result.success).toBe(false);
  });

  it('validates recipient food request schemas', () => {
    const validReq = {
      householdSize: 4,
      dietaryRequirements: ['Gluten-Free', 'Halal-Friendly'],
      urgency: 'HIGH',
      specialNotes: 'Diabetic senior living at home',
    };
    const result = requestSchema.safeParse(validReq);
    expect(result.success).toBe(true);
  });

  it('rejects registration with short password', () => {
    const invalidUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123', // less than 6 chars
      role: 'DONOR',
    };
    const result = registerSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });
});
