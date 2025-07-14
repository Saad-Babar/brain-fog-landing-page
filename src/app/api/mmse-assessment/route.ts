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

    // Calculate individual section scores
    const orientationScore = calculateOrientationScore(orientation);
    const registrationScore = calculateRegistrationScore(registration);
    const attentionScore = calculateAttentionScore(attention);
    const recallScore = calculateRecallScore(recall);
    const languageScore = calculateLanguageScore(language);

    // Calculate total score and interpretation on the server side
    const calculatedTotalScore = orientationScore + registrationScore + attentionScore + recallScore + languageScore;
    const calculatedInterpretation = calculatedTotalScore >= 24 ? "Normal" : "Cognitive impairment";

    // Validate that the frontend score matches the backend calculation
    if (Math.abs(calculatedTotalScore - totalScore) > 2) {
      console.warn(`Score mismatch: Frontend=${totalScore}, Backend=${calculatedTotalScore}`);
    }

    // Use the server-calculated interpretation for consistency
    const finalInterpretation = calculatedInterpretation;

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
      totalScore: calculatedTotalScore,
      interpretation: finalInterpretation,
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
        totalScore: calculatedTotalScore,
        interpretation: finalInterpretation
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
  
  // Get current date for validation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
  
  // Determine current season
  const month = now.getMonth();
  let currentSeason = '';
  if (month >= 2 && month <= 4) currentSeason = 'Spring';
  else if (month >= 5 && month <= 7) currentSeason = 'Summer';
  else if (month >= 8 && month <= 10) currentSeason = 'Autumn';
  else currentSeason = 'Winter';
  
  // Validate each answer with some tolerance for variations
  const yearAnswer = orientation.yearAnswer?.trim().toLowerCase();
  if (yearAnswer === currentYear.toString() || 
      yearAnswer === (currentYear - 1).toString() || 
      yearAnswer === (currentYear + 1).toString()) {
    score += 1;
  }
  
  const seasonAnswer = orientation.seasonAnswer?.trim().toLowerCase();
  if (seasonAnswer === currentSeason.toLowerCase() || 
      seasonAnswer === 'summer' || seasonAnswer === 'winter' || 
      seasonAnswer === 'spring' || seasonAnswer === 'autumn' ||
      seasonAnswer === 'fall') {
    score += 1;
  }
  
  const dateAnswer = orientation.dateAnswer?.trim();
  if (dateAnswer && dateAnswer.length > 0) {
    score += 1;
  }
  
  const dayAnswer = orientation.dayAnswer?.trim().toLowerCase();
  if (dayAnswer === currentDay.toLowerCase() || 
      dayAnswer === 'monday' || dayAnswer === 'tuesday' || 
      dayAnswer === 'wednesday' || dayAnswer === 'thursday' || 
      dayAnswer === 'friday' || dayAnswer === 'saturday' || 
      dayAnswer === 'sunday') {
    score += 1;
  }
  
  const monthAnswer = orientation.monthAnswer?.trim().toLowerCase();
  if (monthAnswer === currentMonth.toLowerCase() || 
      monthAnswer === 'january' || monthAnswer === 'february' || 
      monthAnswer === 'march' || monthAnswer === 'april' || 
      monthAnswer === 'may' || monthAnswer === 'june' || 
      monthAnswer === 'july' || monthAnswer === 'august' || 
      monthAnswer === 'september' || monthAnswer === 'october' || 
      monthAnswer === 'november' || monthAnswer === 'december') {
    score += 1;
  }
  
  // Location questions - more flexible
  const stateAnswer = orientation.stateAnswer?.trim().toLowerCase();
  if (stateAnswer && stateAnswer.length > 2) {
    score += 1;
  }
  
  const countryAnswer = orientation.countryAnswer?.trim().toLowerCase();
  if (countryAnswer === 'pakistan' || countryAnswer === 'pak' || 
      countryAnswer && countryAnswer.length > 2) {
    score += 1;
  }
  
  const hospitalAnswer = orientation.hospitalAnswer?.trim();
  if (hospitalAnswer && hospitalAnswer.length > 2) {
    score += 1;
  }
  
  const floorAnswer = orientation.floorAnswer?.trim().toLowerCase();
  if (floorAnswer && (floorAnswer.includes('floor') || 
      floorAnswer.includes('level') || floorAnswer.includes('ground') ||
      floorAnswer.includes('1') || floorAnswer.includes('2') || 
      floorAnswer.includes('3') || floorAnswer.includes('4') || 
      floorAnswer.includes('5'))) {
    score += 1;
  }
  
  const cityAnswer = orientation.cityAnswer?.trim();
  if (cityAnswer && cityAnswer.length > 2) {
    score += 1;
  }
  
  return score;
}

function calculateRegistrationScore(registration: any): number {
  const wordsTyped = registration.wordsTyped?.trim().toLowerCase();
  
  // Check if all three required words are present
  const requiredWords = ['apple', 'table', 'pen'];
  const typedWords = wordsTyped?.split(/[,\s]+/).filter((word: string) => word.length > 0) || [];
  
  let score = 0;
  requiredWords.forEach((word: string) => {
    if (typedWords.some((typedWord: string) => typedWord.includes(word) || word.includes(typedWord))) {
      score += 1;
    }
  });
  
  return score;
}

function calculateAttentionScore(attention: any): number {
  if (attention.useSubtraction) {
    // Check subtraction answers (100-7, 93-7, 86-7, 79-7, 72-7)
    const correctAnswers = [93, 86, 79, 72, 65];
    let score = 0;
    
    attention.answers?.forEach((answer: string, index: number) => {
      const numAnswer = parseInt(answer?.trim());
      if (numAnswer === correctAnswers[index]) {
        score += 1;
      }
    });
    
    return score;
  } else {
    // Check spelling "WORLD" backwards
    const spellWorld = attention.spellWorld?.trim().toLowerCase();
    const correctSpelling = 'dlrow';
    
    if (spellWorld === correctSpelling) {
      return 5;
    } else {
      // Partial credit for getting some letters right
      let score = 0;
      for (let i = 0; i < Math.min(spellWorld?.length || 0, correctSpelling.length); i++) {
        if (spellWorld?.[i] === correctSpelling[i]) {
          score += 1;
        }
      }
      return score;
    }
  }
}

function calculateRecallScore(recall: any): number {
  const requiredWords = ['apple', 'table', 'pen'];
  let score = 0;
  
  // Check each recalled word
  const word1 = recall.word1?.trim().toLowerCase();
  const word2 = recall.word2?.trim().toLowerCase();
  const word3 = recall.word3?.trim().toLowerCase();
  
  if (requiredWords.some(word => word1?.includes(word) || word.includes(word1))) {
    score += 1;
  }
  if (requiredWords.some(word => word2?.includes(word) || word.includes(word2))) {
    score += 1;
  }
  if (requiredWords.some(word => word3?.includes(word) || word.includes(word3))) {
    score += 1;
  }
  
  return score;
}

function calculateLanguageScore(language: any): number {
  let score = 0;
  
  // Object naming (2 points) - already handled by ObjectRecognition component
  if (language.object1?.answer?.trim()) score += 1;
  if (language.object2?.answer?.trim()) score += 1;
  
  // Repetition (1 point) - check for correct sentence
  const repetition = language.repetition?.trim().toLowerCase();
  const correctSentence = 'no ifs, ands, or buts';
  if (repetition === correctSentence || language.repetitionAudio) {
    score += 1;
  }
  
  // Command (3 points) - check if they completed the task
  const command = language.command?.trim().toLowerCase();
  if (command === 'yes' || command === 'y' || command === 'true' || 
      command?.includes('completed') || command?.includes('done')) {
    score += 3;
  }
  
  // Reading (1 point) - check if they followed instruction
  const reading = language.reading?.trim().toLowerCase();
  if (reading === 'yes' || reading === 'y' || reading === 'true' || 
      reading?.includes('closed') || reading?.includes('eyes')) {
    score += 1;
  }
  
  // Writing (1 point) - check if they wrote a sentence
  const writing = language.writing?.trim();
  if (writing && writing.length > 10 && writing.includes(' ')) {
    score += 1;
  }
  
  // Copying (1 point) - check if they completed the drawing
  const copying = language.copying?.trim().toLowerCase();
  if (copying === 'yes' || copying === 'y' || copying === 'true' || 
      copying?.includes('completed') || copying?.includes('done')) {
    score += 1;
  }
  
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