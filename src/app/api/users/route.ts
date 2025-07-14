import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const query: any = {};
    if (role) query.role = role;
    if (isActive !== null) query.isActive = isActive === 'true';
    const users = await User.find(query).select('-password -__v');
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
} 