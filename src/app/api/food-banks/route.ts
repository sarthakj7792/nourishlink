import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const foodBanks = await prisma.foodBank.findMany({
      include: {
        _count: {
          select: {
            donations: true,
            requests: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ foodBanks });
  } catch (error) {
    console.error('Food banks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch food banks' }, { status: 500 });
  }
}
