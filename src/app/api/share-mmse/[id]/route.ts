import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import SharedMMSE from '@/models/SharedMMSE';
import MMSEAssessment from '@/models/MMSEAssessment';
import MMSEAssessmentUrdu from '@/models/MMSEAssessmentUrdu';
import User from '@/models/User';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const { id } = params;
    const share = await SharedMMSE.findById(id)
      .populate('patientId', 'firstName lastName email')
      .lean();
    if (!share) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    let assessment = await MMSEAssessment.findById(share.assessmentId).lean();
    let language = 'English';
    if (!assessment) {
      assessment = await MMSEAssessmentUrdu.findById(share.assessmentId).lean();
      language = 'Urdu';
    }
    return NextResponse.json({
      _id: share._id,
      sharedAt: share.sharedAt,
      language,
      patient: share.patientId,
      assessment,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shared result.' }, { status: 500 });
  }
} 