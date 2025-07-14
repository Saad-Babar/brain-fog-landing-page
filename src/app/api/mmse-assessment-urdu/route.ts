import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import MMSEAssessmentUrdu from '@/models/MMSEAssessmentUrdu';

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
    const calculatedInterpretation = calculatedTotalScore >= 24 ? "نارمل" : "ذہنی کمزوری (مزید ٹیسٹ کی ضرورت)";

    // Validate that the frontend score matches the backend calculation
    if (Math.abs(calculatedTotalScore - totalScore) > 2) {
      console.warn(`Score mismatch: Frontend=${totalScore}, Backend=${calculatedTotalScore}`);
    }

    // Use the server-calculated interpretation for consistency
    const finalInterpretation = calculatedInterpretation;

    // Create new MMSE assessment
    const newAssessment = new MMSEAssessmentUrdu({
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

// Helper functions to calculate scores for Urdu form
function calculateOrientationScore(orientation: any): number {
  let score = 0;
  
  // Get current date for validation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleString('ur-PK', { month: 'long' });
  const currentDay = now.toLocaleString('ur-PK', { weekday: 'long' });
  
  // Determine current season in Urdu
  const month = now.getMonth();
  let currentSeason = '';
  if (month >= 2 && month <= 4) currentSeason = 'بہار';
  else if (month >= 5 && month <= 7) currentSeason = 'گرمی';
  else if (month >= 8 && month <= 10) currentSeason = 'خزاں';
  else currentSeason = 'سردی';
  
  // Validate each answer with Urdu variations
  const yearAnswer = orientation.yearAnswer?.trim();
  if (yearAnswer === currentYear.toString() || 
      yearAnswer === (currentYear - 1).toString() || 
      yearAnswer === (currentYear + 1).toString()) {
    score += 1;
  }
  
  const seasonAnswer = orientation.seasonAnswer?.trim();
  if (seasonAnswer === currentSeason || 
      seasonAnswer === 'گرمی' || seasonAnswer === 'سردی' || 
      seasonAnswer === 'بہار' || seasonAnswer === 'خزاں') {
    score += 1;
  }
  
  const dateAnswer = orientation.dateAnswer?.trim();
  if (dateAnswer && dateAnswer.length > 0) {
    score += 1;
  }
  
  const dayAnswer = orientation.dayAnswer?.trim();
  if (dayAnswer === currentDay || 
      dayAnswer === 'پیر' || dayAnswer === 'منگل' || 
      dayAnswer === 'بدھ' || dayAnswer === 'جمعرات' || 
      dayAnswer === 'جمعہ' || dayAnswer === 'ہفتہ' || 
      dayAnswer === 'اتوار') {
    score += 1;
  }
  
  const monthAnswer = orientation.monthAnswer?.trim();
  if (monthAnswer === currentMonth || 
      monthAnswer === 'جنوری' || monthAnswer === 'فروری' || 
      monthAnswer === 'مارچ' || monthAnswer === 'اپریل' || 
      monthAnswer === 'مئی' || monthAnswer === 'جون' || 
      monthAnswer === 'جولائی' || monthAnswer === 'اگست' || 
      monthAnswer === 'ستمبر' || monthAnswer === 'اکتوبر' || 
      monthAnswer === 'نومبر' || monthAnswer === 'دسمبر') {
    score += 1;
  }
  
  // Location questions - more flexible for Urdu
  const stateAnswer = orientation.stateAnswer?.trim();
  if (stateAnswer && stateAnswer.length > 2) {
    score += 1;
  }
  
  const countryAnswer = orientation.countryAnswer?.trim();
  if (countryAnswer === 'پاکستان' || countryAnswer === 'پاک' || 
      countryAnswer && countryAnswer.length > 2) {
    score += 1;
  }
  
  const hospitalAnswer = orientation.hospitalAnswer?.trim();
  if (hospitalAnswer && hospitalAnswer.length > 2) {
    score += 1;
  }
  
  const floorAnswer = orientation.floorAnswer?.trim();
  if (floorAnswer && (floorAnswer.includes('منزل') || 
      floorAnswer.includes('فلور') || floorAnswer.includes('زمین') ||
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
  const wordsTyped = registration.wordsTyped?.trim();
  
  // Check if all three required words are present (Urdu words)
  const requiredWords = ['سیب', 'میز', 'قلم'];
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
    // Check spelling "دنیا" backwards (should be "آیند")
    const spellWorld = attention.spellWorld?.trim();
    const correctSpelling = 'آیند';
    
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
  const requiredWords = ['سیب', 'میز', 'قلم'];
  let score = 0;
  
  // Check each recalled word
  const word1 = recall.word1?.trim();
  const word2 = recall.word2?.trim();
  const word3 = recall.word3?.trim();
  
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
  
  // Repetition (1 point) - check for correct sentence in Urdu
  const repetition = language.repetition?.trim();
  const correctSentence = 'نہ اگر، نہ اور، نہ لیکن';
  if (repetition === correctSentence || language.repetitionAudio) {
    score += 1;
  }
  
  // Command (3 points) - check if they completed the task
  const command = language.command?.trim();
  if (command === 'ہاں' || command === 'جی ہاں' || command === 'ہاں' || 
      command?.includes('مکمل') || command?.includes('کر لیا')) {
    score += 3;
  }
  
  // Reading (1 point) - check if they followed instruction
  const reading = language.reading?.trim();
  if (reading === 'ہاں' || reading === 'جی ہاں' || reading === 'ہاں' || 
      reading?.includes('بند') || reading?.includes('آنکھیں')) {
    score += 1;
  }
  
  // Writing (1 point) - check if they wrote a sentence in Urdu
  const writing = language.writing?.trim();
  if (writing && writing.length > 10 && writing.includes(' ')) {
    score += 1;
  }
  
  // Copying (1 point) - check if they completed the drawing
  const copying = language.copying?.trim();
  if (copying === 'ہاں' || copying === 'جی ہاں' || copying === 'ہاں' || 
      copying?.includes('مکمل') || copying?.includes('کر لیا')) {
    score += 1;
  }
  
  return score;
}

// GET endpoint to retrieve user's Urdu assessments
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
    const assessments = await MMSEAssessmentUrdu.find({ userId: session.user.id })
      .sort({ assessmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const totalAssessments = await MMSEAssessmentUrdu.countDocuments({ userId: session.user.id });

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