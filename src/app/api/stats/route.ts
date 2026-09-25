import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalDonationsCount = await prisma.foodDonation.count();
    const availableDonationsCount = await prisma.foodDonation.count({
      where: { status: 'AVAILABLE' },
    });
    const totalDistributedCount = await prisma.foodDonation.count({
      where: { status: 'DISTRIBUTED' },
    });

    const totalRequestsCount = await prisma.recipientRequest.count();
    const pendingRequestsCount = await prisma.recipientRequest.count({
      where: { status: 'PENDING' },
    });
    const fulfilledRequestsCount = await prisma.recipientRequest.count({
      where: { status: 'FULFILLED' },
    });

    const foodBanksCount = await prisma.foodBank.count();

    // Aggregate food quantity saved (in KG equivalent estimate)
    const donations = await prisma.foodDonation.findMany({
      select: { quantity: true, unit: true },
    });

    let totalKgSaved = 0;
    for (const d of donations) {
      if (d.unit === 'KG') totalKgSaved += d.quantity;
      else if (d.unit === 'LBS') totalKgSaved += d.quantity * 0.4535;
      else if (d.unit === 'BOXES') totalKgSaved += d.quantity * 10;
      else totalKgSaved += d.quantity * 0.5; // items
    }

    const co2OffsetKg = Math.round(totalKgSaved * 2.5); // Standard FAO food waste footprint: ~2.5kg CO2 per kg food saved

    return NextResponse.json({
      totalDonationsCount,
      availableDonationsCount,
      totalDistributedCount,
      totalRequestsCount,
      pendingRequestsCount,
      fulfilledRequestsCount,
      foodBanksCount,
      totalKgSaved: Math.round(totalKgSaved),
      co2OffsetKg,
      mealsDistributed: Math.round(totalKgSaved * 2.2), // ~450g per meal
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}
