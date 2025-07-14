import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import SharedMMSE from '@/models/SharedMMSE';
import MMSEAssessment from '@/models/MMSEAssessment';
import MMSEAssessmentUrdu from '@/models/MMSEAssessmentUrdu';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const { assessmentId, doctorId } = await request.json();

    // Find assessment in either collection
    let assessment = await MMSEAssessment.findById(assessmentId);
    let language = 'English';
    if (!assessment) {
      assessment = await MMSEAssessmentUrdu.findById(assessmentId);
      language = 'Urdu';
    }
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Prevent duplicate shares
    const existing = await SharedMMSE.findOne({ assessmentId, doctorId });
    if (existing) {
      return NextResponse.json({ error: 'Already shared with this doctor.' }, { status: 409 });
    }

    // Save share record
    await SharedMMSE.create({
      assessmentId,
      doctorId,
      patientId: session.user.id,
      language,
      sharedAt: new Date()
    });

    // (Optional) TODO: Notify doctor here

    return NextResponse.json({ message: 'Shared successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to share test.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    // Only allow doctors to fetch their shared results
    const doctorId = session.user.id;
    const shares = await SharedMMSE.find({ doctorId })
      .sort({ sharedAt: -1 })
      .populate('patientId', 'firstName lastName email')
      .lean();
    // For each share, fetch assessment summary
    const results = await Promise.all(shares.map(async (share) => {
      let assessment = await MMSEAssessment.findById(share.assessmentId).lean();
      if (!assessment) {
        assessment = await MMSEAssessmentUrdu.findById(share.assessmentId).lean();
      }
      return {
        _id: share._id,
        sharedAt: share.sharedAt,
        language: share.language,
        patient: share.patientId,
        assessment: assessment ? {
          assessmentDate: assessment.assessmentDate,
          totalScore: assessment.totalScore,
          interpretation: assessment.interpretation,
          language: share.language,
          _id: assessment._id,
        } : null
      };
    }));
    return NextResponse.json({ shared: results });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shared results.' }, { status: 500 });
  }
} 