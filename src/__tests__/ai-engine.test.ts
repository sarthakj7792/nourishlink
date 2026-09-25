import { describe, it, expect } from 'vitest';
import { analyzeFoodPerishability, matchDonationWithRequests } from '@/lib/ai-engine';

describe('Perishability and Triage Engine', () => {
  it('assigns high urgency score to highly perishable items near expiry', () => {
    const tomorrow = new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString();
    const result = analyzeFoodPerishability({
      title: 'Fresh Milk & Yogurt',
      category: 'DAIRY',
      perishableDate: tomorrow,
      storageReq: 'AMBIENT', // Left ambient increases danger multiplier
      quantity: 10,
      unit: 'ITEMS',
    });

    expect(result.urgencyScore).toBeGreaterThanOrEqual(70);
    expect(result.priorityLevel).toBe('CRITICAL');
    expect(result.distributionRecommendation).toContain('Immediate direct dispatch');
  });

  it('assigns low urgency score to shelf-stable canned goods', () => {
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const result = analyzeFoodPerishability({
      title: 'Canned Mixed Beans',
      category: 'CANNED',
      perishableDate: nextMonth,
      storageReq: 'AMBIENT',
      quantity: 50,
      unit: 'ITEMS',
    });

    expect(result.urgencyScore).toBeLessThan(35);
    expect(result.priorityLevel).toBe('LOW');
  });

  it('infers dietary tags like Vegetarian and Vegan for plant produce', () => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = analyzeFoodPerishability({
      title: 'Fresh Crisp Apples & Carrots',
      category: 'PRODUCE',
      perishableDate: nextWeek,
      storageReq: 'REFRIGERATED',
      quantity: 20,
      unit: 'KG',
    });

    expect(result.suggestedDietaryTags).toContain('Vegetarian');
    expect(result.suggestedDietaryTags).toContain('Vegan');
  });
});

describe('Algorithmic Recipient Matching Engine', () => {
  it('correctly ranks recipient requests according to dietary alignment and urgency tier', () => {
    const donation = {
      category: 'PRODUCE',
      dietaryTags: ['Vegetarian', 'Gluten-Free', 'Halal-Friendly'],
      quantity: 15,
    };

    const requests = [
      {
        id: 'req-1',
        recipientName: 'Maria',
        householdSize: 4,
        dietaryRequirements: ['Vegetarian', 'Gluten-Free'],
        urgency: 'HIGH',
      },
      {
        id: 'req-2',
        recipientName: 'John',
        householdSize: 1,
        dietaryRequirements: ['Nut-Free'],
        urgency: 'LOW',
      },
    ];

    const matches = matchDonationWithRequests(donation, requests);

    expect(matches.length).toBe(2);
    // Maria has both high urgency and 100% dietary tag match
    expect(matches[0].recipientName).toBe('Maria');
    expect(matches[0].matchScore).toBeGreaterThan(matches[1].matchScore);
  });
});
