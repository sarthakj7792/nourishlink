import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { donationSchema } from '@/lib/validations';
import { analyzeFoodPerishability } from '@/lib/ai-engine';

// GET Single Donation
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const donation = await prisma.foodDonation.findUnique({
      where: { id },
      include: {
        donor: { select: { id: true, name: true, email: true, phone: true, city: true } },
        foodBank: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    return NextResponse.json({ donation });
  } catch (error) {
    console.error('Single donation GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// UPDATE Donation (Owner or ADMIN)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.foodDonation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Role check: Only the owner or an ADMIN can modify
    if (existing.donorId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this donation' }, { status: 403 });
    }

    const body = await req.json();

    // Partial update: status-only (e.g. AVAILABLE -> RESERVED -> DISTRIBUTED)
    if (body.status && Object.keys(body).length <= 2) {
      const validStatuses = ['AVAILABLE', 'RESERVED', 'DISTRIBUTED', 'CANCELLED'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      const updated = await prisma.foodDonation.update({
        where: { id },
        data: {
          status: body.status,
          foodBankId: body.foodBankId ?? existing.foodBankId,
        },
      });
      return NextResponse.json({ donation: updated });
    }

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

    const triage = analyzeFoodPerishability({
      title,
      category,
      perishableDate,
      storageReq,
      quantity,
      unit,
    });

    const updated = await prisma.foodDonation.update({
      where: { id },
      data: {
        title,
        description,
        category,
        quantity,
        unit,
        perishableDate: new Date(perishableDate),
        storageReq,
        foodBankId: foodBankId || null,
        aiUrgencyScore: triage.urgencyScore,
        aiTriageNotes: `${triage.triageRationale} Recommendation: ${triage.distributionRecommendation}`,
        dietaryTags: JSON.stringify(dietaryTags || []),
        pickupAddress: pickupAddress || null,
        notes: notes || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ donation: updated });
  } catch (error) {
    console.error('Donation PUT error:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}

// DELETE Donation (Owner or ADMIN)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.foodDonation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    if (existing.donorId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You cannot delete this donation' }, { status: 403 });
    }

    await prisma.foodDonation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Donation DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
  }
}
