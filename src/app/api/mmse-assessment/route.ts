import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import MMSEAssessment from '@/models/MMSEAssessment';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const {
      orientation,
      registration,
      attention,
      recall,
      language,
      totalScore,
      interpretation,
      drawingImage
    } = body;

    // Validation
    if (!orientation || !registration || !attention || !recall || !language) {
      return NextResponse.json(
        { error: 'Missing required assessment data' },
        { status: 400 }
      );
    }

    if (typeof totalScore !== 'number' || totalScore < 0 || totalScore > 30) {
      return NextResponse.json(
        { error: 'Invalid total score' },
        { status: 400 }
      );
    }

    if (!interpretation || !['Normal', 'Cognitive impairment'].includes(interpretation)) {
      return NextResponse.json(
        { error: 'Invalid interpretation' },
        { status: 400 }
      );
    }

    // Calculate individual section scores
    const orientationScore = calculateOrientationScore(orientation);
    const registrationScore = calculateRegistrationScore(registration);
    const attentionScore = calculateAttentionScore(attention);
    const recallScore = calculateRecallScore(recall);
    const languageScore = calculateLanguageScore(language);

    // Create new MMSE assessment
    const newAssessment = new MMSEAssessment({
      userId: session.user.id,
      orientation: {
        ...orientation,
        score: orientationScore
      },
      registration: {
        ...registration,
        score: registrationScore
      },
      attention: {
        ...attention,
        score: attentionScore
      },
      recall: {
        ...recall,
        score: recallScore
      },
      language: {
        ...language,
        score: languageScore
      },
      totalScore,
      interpretation,
      drawingImage,
      assessmentDate: new Date()
    });

    // Save to database
    await newAssessment.save();

    // Return success response
    return NextResponse.json(
      { 
        message: 'MMSE assessment saved successfully',
        assessmentId: newAssessment._id,
        totalScore,
        interpretation
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('MMSE assessment save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions to calculate scores
function calculateOrientationScore(orientation: any): number {
  let score = 0;
  if (orientation.yearAnswer?.trim()) score += 1;
  if (orientation.seasonAnswer?.trim()) score += 1;
  if (orientation.dateAnswer?.trim()) score += 1;
  if (orientation.dayAnswer?.trim()) score += 1;
  if (orientation.monthAnswer?.trim()) score += 1;
  if (orientation.stateAnswer?.trim()) score += 1;
  if (orientation.countryAnswer?.trim()) score += 1;
  if (orientation.hospitalAnswer?.trim()) score += 1;
  if (orientation.floorAnswer?.trim()) score += 1;
  if (orientation.cityAnswer?.trim()) score += 1;
  return score;
}

function calculateRegistrationScore(registration: any): number {
  return registration.wordsTyped?.trim() ? 3 : 0;
}

function calculateAttentionScore(attention: any): number {
  if (attention.useSubtraction) {
    return attention.answers?.filter((answer: string) => answer?.trim() !== "").length || 0;
  } else {
    return attention.spellWorld?.trim() ? 5 : 0;
  }
}

function calculateRecallScore(recall: any): number {
  let score = 0;
  if (recall.word1?.trim()) score += 1;
  if (recall.word2?.trim()) score += 1;
  if (recall.word3?.trim()) score += 1;
  return score;
}

function calculateLanguageScore(language: any): number {
  let score = 0;
  if (language.pencil?.trim()) score += 1;
  if (language.watch?.trim()) score += 1;
  if (language.repetition?.trim()) score += 1;
  if (language.command?.trim()) score += 1;
  if (language.reading?.trim()) score += 1;
  if (language.writing?.trim()) score += 1;
  if (language.copying?.trim()) score += 1;
  return score;
}

// GET endpoint to retrieve user's assessments
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get user's assessments with pagination
    const assessments = await MMSEAssessment.find({ userId: session.user.id })
      .sort({ assessmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const totalAssessments = await MMSEAssessment.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      assessments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAssessments / limit),
        totalAssessments,
        hasNextPage: page * limit < totalAssessments,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('MMSE assessment retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 