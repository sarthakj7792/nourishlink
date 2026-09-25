import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { matchDonationWithRequests } from '@/lib/ai-engine';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DONOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { donationId } = body;

    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 });
    }

    const donation = await prisma.foodDonation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Retrieve pending requests
    const pendingRequests = await prisma.recipientRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        recipient: { select: { id: true, name: true } },
      },
    });

    const parsedTags: string[] = JSON.parse(donation.dietaryTags || '[]');

    const formattedRequests = pendingRequests.map((r: any) => ({
      id: r.id,
      recipientName: r.recipient?.name || 'Anonymous Recipient',
      householdSize: r.householdSize,
      dietaryRequirements: JSON.parse(r.dietaryRequirements || '[]') as string[],
      urgency: r.urgency,
    }));

    const recommendations = matchDonationWithRequests(
      {
        category: donation.category,
        dietaryTags: parsedTags,
        quantity: donation.quantity,
      },
      formattedRequests
    );

    return NextResponse.json({
      donationId,
      donationTitle: donation.title,
      totalPendingRequests: pendingRequests.length,
      recommendations,
    });
  } catch (error) {
    console.error('AI Match error:', error);
    return NextResponse.json({ error: 'Failed to compute AI matches' }, { status: 500 });
  }
}
