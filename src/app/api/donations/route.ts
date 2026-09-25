import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { donationSchema } from '@/lib/validations';
import { analyzeFoodPerishability } from '@/lib/ai-engine';

// READ Donations (Filtered by category, status, foodBank)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const donorOnly = searchParams.get('donorOnly');

    const session = await getSession();

    const where: Record<string, any> = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (donorOnly === 'true' && session) {
      where.donorId = session.id;
    }

    const donations = await prisma.foodDonation.findMany({
      where,
      include: {
        donor: {
          select: { id: true, name: true, city: true, phone: true },
        },
        foodBank: {
          select: { id: true, name: true, city: true },
        },
      },
      orderBy: [
        { status: 'asc' },
        { perishableDate: 'asc' },
      ],
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error('Donations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

// CREATE Food Donation (Requires DONOR or ADMIN)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'DONOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Donor access required' }, { status: 403 });
    }

    const body = await req.json();
    const result = donationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      category,
      quantity,
      unit,
      perishableDate,
      storageReq,
      foodBankId,
      dietaryTags,
      pickupAddress,
      notes,
      imageUrl,
    } = result.data;

    // Run AI Triage Engine to predict urgency and distribution strategy
    const triage = analyzeFoodPerishability({
      title,
      category,
      perishableDate,
      storageReq,
      quantity,
      unit,
    });

    const tags = dietaryTags && dietaryTags.length > 0 ? dietaryTags : triage.suggestedDietaryTags;

    const donation = await prisma.foodDonation.create({
      data: {
        donorId: session.id,
        foodBankId: foodBankId || null,
        title,
        description,
        category,
        quantity,
        unit,
        perishableDate: new Date(perishableDate),
        storageReq,
        status: 'AVAILABLE',
        aiUrgencyScore: triage.urgencyScore,
        aiTriageNotes: `${triage.triageRationale} Recommendation: ${triage.distributionRecommendation}`,
        dietaryTags: JSON.stringify(tags),
        pickupAddress: pickupAddress || null,
        notes: notes || null,
        imageUrl: imageUrl || null,
      },
      include: {
        donor: { select: { id: true, name: true } },
        foodBank: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ donation, triage }, { status: 201 });
  } catch (error) {
    console.error('Donations POST error:', error);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
