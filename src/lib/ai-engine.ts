export interface FoodTriageInput {
  title: string;
  category: string;
  perishableDate: string; // ISO date string
  storageReq: 'AMBIENT' | 'REFRIGERATED' | 'FROZEN';
  quantity: number;
  unit: string;
}

export interface FoodTriageOutput {
  urgencyScore: number; // 1 to 100
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHoursRemaining: number;
  triageRationale: string;
  distributionRecommendation: string;
  suggestedDietaryTags: string[];
}

export interface MatchRecommendation {
  requestId: string;
  recipientName: string;
  householdSize: number;
  matchScore: number; // 0 to 100%
  reasons: string[];
}

/**
 * Intelligent AI Triage & Expiry Prediction Engine.
 * Formulates realistic urgency metrics based on perishable science, temperature conditions,
 * packaging storage, and immediate distribution needs.
 */
export function analyzeFoodPerishability(input: FoodTriageInput): FoodTriageOutput {
  const now = new Date().getTime();
  const expiry = new Date(input.perishableDate).getTime();
  const msRemaining = expiry - now;
  const hoursRemaining = Math.max(0, Math.round(msRemaining / (1000 * 60 * 60)));

  // Base urgency factor by category vulnerability
  const categoryRisk: Record<string, number> = {
    DAIRY: 35,
    PREPARED: 40,
    PRODUCE: 25,
    BAKERY: 25,
    BEVERAGES: 10,
    CANNED: 5,
    OTHER: 15,
  };

  const baseRisk = categoryRisk[input.category] ?? 15;

  // Temperature acceleration multiplier
  let storageFactor = 1.0;
  if (input.storageReq === 'AMBIENT' && (input.category === 'DAIRY' || input.category === 'PREPARED')) {
    storageFactor = 1.8; // High danger if left ambient
  } else if (input.storageReq === 'FROZEN') {
    storageFactor = 0.5; // Frozen prolongs safety window
  }

  // Time decay calculation
  let timeUrgency = 0;
  if (hoursRemaining <= 12) {
    timeUrgency = 60;
  } else if (hoursRemaining <= 24) {
    timeUrgency = 45;
  } else if (hoursRemaining <= 48) {
    timeUrgency = 30;
  } else if (hoursRemaining <= 96) {
    timeUrgency = 15;
  } else {
    timeUrgency = 5;
  }

  const calculatedScore = Math.min(100, Math.max(1, Math.round((baseRisk + timeUrgency) * storageFactor)));

  let priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (calculatedScore >= 80) priorityLevel = 'CRITICAL';
  else if (calculatedScore >= 60) priorityLevel = 'HIGH';
  else if (calculatedScore >= 35) priorityLevel = 'MEDIUM';

  // Dietary tag prediction based on common items
  const suggestedDietaryTags: string[] = [];
  const text = (input.title + ' ' + input.category).toLowerCase();
  if (text.includes('salad') || text.includes('apple') || text.includes('bread') || text.includes('vegetable') || text.includes('carrot') || input.category === 'PRODUCE') {
    suggestedDietaryTags.push('Vegetarian');
  }
  if (text.includes('fruit') || text.includes('vegetable') || text.includes('oat') || text.includes('bean') || text.includes('rice') || text.includes('apple') || text.includes('carrot') || input.category === 'PRODUCE') {
    suggestedDietaryTags.push('Vegan');
  }
  if (!text.includes('bread') && !text.includes('pasta') && !text.includes('flour') && !text.includes('wheat') && !text.includes('bakery')) {
    suggestedDietaryTags.push('Gluten-Free');
  }
  if (!text.includes('pork') && !text.includes('bacon') && !text.includes('ham') && !text.includes('wine')) {
    suggestedDietaryTags.push('Halal-Friendly');
  }
  if (text.includes('low-sodium') || text.includes('fresh') || text.includes('vegetable') || text.includes('canned vegetable')) {
    suggestedDietaryTags.push('Diabetic-Friendly');
  }

  let triageRationale = '';
  let distributionRecommendation = '';

  if (priorityLevel === 'CRITICAL') {
    triageRationale = `High perishability risk: ${input.category} item with only ${hoursRemaining}h before shelf-life cutoff under ${input.storageReq.toLowerCase()} storage.`;
    distributionRecommendation = 'Immediate direct dispatch to evening soup kitchens or urgent community walk-ins within 6 hours.';
  } else if (priorityLevel === 'HIGH') {
    triageRationale = `Moderate-to-fast deterioration timeline. Requires distribution within ${hoursRemaining} hours.`;
    distributionRecommendation = 'Prioritize for today\'s scheduled pantry appointments or emergency family relief bundles.';
  } else if (priorityLevel === 'MEDIUM') {
    triageRationale = `Stable shelf life remaining (~${Math.round(hoursRemaining / 24)} days). Normal pantry staging suitable.`;
    distributionRecommendation = 'Eligible for standard weekly community food boxes or mobile pantry route allocations.';
  } else {
    triageRationale = `Extended shelf-life food item (${input.category}) in ${input.storageReq} condition with optimal shelf stability.`;
    distributionRecommendation = 'Stage into central reserve inventory for buffer stock and long-term pantry distribution.';
  }

  return {
    urgencyScore: calculatedScore,
    priorityLevel,
    estimatedHoursRemaining: hoursRemaining,
    triageRationale,
    distributionRecommendation,
    suggestedDietaryTags,
  };
}

/**
 * Calculates optimal algorithmic matching between a food donation batch
 * and candidate recipient requests.
 */
export function matchDonationWithRequests(
  donation: {
    category: string;
    dietaryTags: string[];
    quantity: number;
  },
  requests: Array<{
    id: string;
    recipientName: string;
    householdSize: number;
    dietaryRequirements: string[];
    urgency: string;
  }>
): MatchRecommendation[] {
  return requests.map((req) => {
    let score = 50;
    const reasons: string[] = [];

    // Urgency weighting
    if (req.urgency === 'EMERGENCY') {
      score += 25;
      reasons.push('High emergency recipient tier priority');
    } else if (req.urgency === 'HIGH') {
      score += 15;
      reasons.push('Elevated recipient need');
    }

    // Dietary compliance checks
    let satisfiedDietaryCount = 0;
    for (const need of req.dietaryRequirements) {
      if (donation.dietaryTags.some(tag => tag.toLowerCase() === need.toLowerCase())) {
        satisfiedDietaryCount++;
      }
    }

    if (req.dietaryRequirements.length > 0) {
      if (satisfiedDietaryCount === req.dietaryRequirements.length) {
        score += 20;
        reasons.push(`100% dietary requirement match (${satisfiedDietaryCount} tags aligned)`);
      } else if (satisfiedDietaryCount > 0) {
        score += 10;
        reasons.push(`Partial dietary requirement alignment`);
      } else {
        score -= 20;
        reasons.push('Dietary restrictions may require caution');
      }
    } else {
      score += 5;
      reasons.push('No restrictive dietary barriers');
    }

    // Household sizing adequacy
    if (req.householdSize >= 4 && donation.quantity >= 5) {
      score += 10;
      reasons.push(`Batch quantity (${donation.quantity}) adequately sustains household size of ${req.householdSize}`);
    }

    return {
      requestId: req.id,
      recipientName: req.recipientName,
      householdSize: req.householdSize,
      matchScore: Math.min(100, Math.max(10, score)),
      reasons,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
