import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone, address, city, zipCode } = result.data;

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone,
        address,
        city,
        zipCode,
        isVerified: true,
      },
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'DONOR' | 'RECIPIENT' | 'ADMIN',
    });

    const res = NextResponse.json(
      {
        message: 'Account registered successfully',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
