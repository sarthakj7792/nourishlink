import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// UPDATE Request status / match
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.recipientRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (existing.recipientId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.recipientRequest.update({
      where: { id },
      data: {
        status: body.status ?? existing.status,
        matchedDonationId: body.matchedDonationId ?? existing.matchedDonationId,
        specialNotes: body.specialNotes ?? existing.specialNotes,
      },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Request PUT error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

// DELETE Request
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.recipientRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (existing.recipientId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.recipientRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Request removed successfully' });
  } catch (error) {
    console.error('Request DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
