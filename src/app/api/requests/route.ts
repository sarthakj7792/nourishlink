import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { requestSchema } from '@/lib/validations';

// GET Recipient Requests
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: Record<string, any> = {};
    if (session.role === 'RECIPIENT') {
      where.recipientId = session.id;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const requests = await prisma.recipientRequest.findMany({
      where,
      include: {
        recipient: {
          select: { id: true, name: true, city: true, phone: true },
        },
        foodBank: {
          select: { id: true, name: true, address: true, contactPhone: true },
        },
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Requests GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch food requests' }, { status: 500 });
  }
}

// CREATE Recipient Request (RECIPIENT or ADMIN)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { householdSize, dietaryRequirements, urgency, foodBankId, specialNotes } = result.data;

    const newRequest = await prisma.recipientRequest.create({
      data: {
        recipientId: session.id,
        foodBankId: foodBankId || null,
        householdSize,
        dietaryRequirements: JSON.stringify(dietaryRequirements || []),
        urgency,
        status: 'PENDING',
        specialNotes: specialNotes || null,
      },
      include: {
        foodBank: true,
      },
    });

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Requests POST error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
