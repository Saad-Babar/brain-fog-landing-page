"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Checkbox } from "@/components/FormElements/checkbox";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { useSession } from "next-auth/react";
import DrawingCanvas from "@/components/DrawingCanvas";
import ObjectRecognition from "@/components/ObjectRecognition";
import VoiceRecorder from "@/components/VoiceRecorder";

interface MMSEFormData {
  // Section 1: Orientation
  orientation: {
    yearAnswer: string;
    seasonAnswer: string;
    dateAnswer: string;
    dayAnswer: string;
    monthAnswer: string;
    stateAnswer: string;
    countryAnswer: string;
    hospitalAnswer: string;
    floorAnswer: string;
    cityAnswer: string;
  };
  // Section 2: Registration
  registration: {
    wordsTyped: string;
  };
  // Section 3: Attention and Calculation
  attention: {
    useSubtraction: boolean;
    answers: string[];
    spellWorld: string;
  };
  // Section 4: Recall
  recall: {
    word1: string;
    word2: string;
    word3: string;
  };
  // Section 5: Language
  language: {
    object1: {
      name: string;
      answer: string;
    };
    object2: {
      name: string;
      answer: string;
    };
    repetition: string;
    repetitionAudio?: string; // Base64 audio data
    command: string;
    reading: string;
    writing: string;
    copying: string;
    drawingImage?: string; // Base64 image data
  };
}

const SECTIONS = [
  { id: 1, title: "Orientation", points: 10 },
  { id: 2, title: "Memory", points: 3 },
  { id: 3, title: "Attention", points: 5 },
  { id: 4, title: "Recall", points: 3 },
  { id: 5, title: "Language", points: 9 },
];

export default function MMSEFormPage() {
  const { data: session } = useSession();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<MMSEFormData>({
    orientation: {
      yearAnswer: "",
      seasonAnswer: "",
      dateAnswer: "",
      dayAnswer: "",
      monthAnswer: "",
      stateAnswer: "",
      countryAnswer: "",
      hospitalAnswer: "",
      floorAnswer: "",
      cityAnswer: "",
    },
    registration: {
      wordsTyped: "",
    },
    attention: {
      useSubtraction: true,
      answers: ["", "", "", "", ""],
      spellWorld: "",
    },
    recall: {
      word1: "",
      word2: "",
      word3: "",
    },
    language: {
      object1: {
        name: "",
        answer: "",
      },
      object2: {
        name: "",
        answer: "",
      },
      repetition: "",
      repetitionAudio: "",
      command: "",
      reading: "",
      writing: "",
      copying: "",
    },
  });

  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [drawingSaved, setDrawingSaved] = useState(false);

  const updateOrientation = (field: keyof typeof formData.orientation, value: string) => {
    setFormData(prev => ({
      ...prev,
      orientation: {
        ...prev.orientation,
        [field]: value
      }
    }));
  };

  const updateRegistration = (field: keyof typeof formData.registration, value: string) => {
    setFormData(prev => ({
      ...prev,
      registration: {
        ...prev.registration,
        [field]: value
      }
    }));
  };

  const updateAttention = (field: keyof typeof formData.attention, value: any) => {
    setFormData(prev => ({
      ...prev,
      attention: {
        ...prev.attention,
        [field]: value
      }
    }));
  };

  const updateRecall = (field: keyof typeof formData.recall, value: string) => {
    setFormData(prev => ({
      ...prev,
      recall: {
        ...prev.recall,
        [field]: value
      }
    }));
  };

  const updateLanguage = (field: keyof typeof formData.language, value: string) => {
    setFormData(prev => ({
      ...prev,
      language: {
        ...prev.language,
        [field]: value
      }
    }));
  };

  const updateObjectAnswer = (objectKey: 'object1' | 'object2', objectName: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      language: {
        ...prev.language,
        [objectKey]: {
          name: objectName,
          answer: answer
        }
      }
    }));
  };

  const handleDrawingSave = (imageData: string) => {
    setFormData(prev => ({
      ...prev,
      language: {
        ...prev.language,
        drawingImage: imageData
      }
    }));
    setDrawingSaved(true);
    
    // Reset the indicator after 3 seconds
    setTimeout(() => setDrawingSaved(false), 3000);
  };

  const handleAudioSave = (audioData: string) => {
    setFormData(prev => ({
      ...prev,
      language: {
        ...prev.language,
        repetitionAudio: audioData
      }
    }));
    
    // Show a brief success message
    if (audioData) {
      const audioSaved = document.createElement('div');
      audioSaved.className = 'fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50';
      audioSaved.textContent = '✓ Audio recorded successfully!';
      document.body.appendChild(audioSaved);
      
      setTimeout(() => {
        document.body.removeChild(audioSaved);
      }, 3000);
    }
  };

  const calculateOrientationScore = () => {
    const { orientation } = formData;
    let score = 0;
    
    // Get current date for validation
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.toLocaleString('en-US', { month: 'long' });
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
    const currentDate = now.getDate();
    
    // Determine current season
    const month = now.getMonth();
    let currentSeason = '';
    if (month >= 2 && month <= 4) currentSeason = 'Spring';
    else if (month >= 5 && month <= 7) currentSeason = 'Summer';
    else if (month >= 8 && month <= 10) currentSeason = 'Autumn';
    else currentSeason = 'Winter';
    
    // Validate each answer with some tolerance for variations
    const yearAnswer = orientation.yearAnswer.trim().toLowerCase();
    if (yearAnswer === currentYear.toString() || 
        yearAnswer === (currentYear - 1).toString() || 
        yearAnswer === (currentYear + 1).toString()) {
      score += 1;
    }
    
    const seasonAnswer = orientation.seasonAnswer.trim().toLowerCase();
    if (seasonAnswer === currentSeason.toLowerCase() || 
        seasonAnswer === 'summer' || seasonAnswer === 'winter' || 
        seasonAnswer === 'spring' || seasonAnswer === 'autumn' ||
        seasonAnswer === 'fall') {
      score += 1;
    }
    
    const dateAnswer = orientation.dateAnswer.trim();
    if (dateAnswer && dateAnswer.length > 0) {
      // Accept reasonable date formats
      score += 1;
    }
    
    const dayAnswer = orientation.dayAnswer.trim().toLowerCase();
    if (dayAnswer === currentDay.toLowerCase() || 
        dayAnswer === 'monday' || dayAnswer === 'tuesday' || 
        dayAnswer === 'wednesday' || dayAnswer === 'thursday' || 
        dayAnswer === 'friday' || dayAnswer === 'saturday' || 
        dayAnswer === 'sunday') {
      score += 1;
    }
    
    const monthAnswer = orientation.monthAnswer.trim().toLowerCase();
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
    const stateAnswer = orientation.stateAnswer.trim().toLowerCase();
    if (stateAnswer && stateAnswer.length > 2) {
      score += 1;
    }
    
    const countryAnswer = orientation.countryAnswer.trim().toLowerCase();
    if (countryAnswer === 'pakistan' || countryAnswer === 'pak' || 
        countryAnswer && countryAnswer.length > 2) {
      score += 1;
    }
    
    const hospitalAnswer = orientation.hospitalAnswer.trim();
    if (hospitalAnswer && hospitalAnswer.length > 2) {
      score += 1;
    }
    
    const floorAnswer = orientation.floorAnswer.trim().toLowerCase();
    if (floorAnswer && (floorAnswer.includes('floor') || 
        floorAnswer.includes('level') || floorAnswer.includes('ground') ||
        floorAnswer.includes('1') || floorAnswer.includes('2') || 
        floorAnswer.includes('3') || floorAnswer.includes('4') || 
        floorAnswer.includes('5'))) {
      score += 1;
    }
    
    const cityAnswer = orientation.cityAnswer.trim();
    if (cityAnswer && cityAnswer.length > 2) {
      score += 1;
    }
    
    return score;
  };

  const calculateRegistrationScore = () => {
    const { registration } = formData;
    const wordsTyped = registration.wordsTyped.trim().toLowerCase();
    
    // Check if all three required words are present
    const requiredWords = ['apple', 'table', 'pen'];
    const typedWords = wordsTyped.split(/[,\s]+/).filter(word => word.length > 0);
    
    let score = 0;
    requiredWords.forEach(word => {
      if (typedWords.some(typedWord => typedWord.includes(word) || word.includes(typedWord))) {
        score += 1;
      }
    });
    
    return score;
  };

  const calculateAttentionScore = () => {
    const { attention } = formData;
    if (attention.useSubtraction) {
      // Check subtraction answers (100-7, 93-7, 86-7, 79-7, 72-7)
      const correctAnswers = [93, 86, 79, 72, 65];
      let score = 0;
      
      attention.answers.forEach((answer, index) => {
        const numAnswer = parseInt(answer.trim());
        if (numAnswer === correctAnswers[index]) {
          score += 1;
        }
      });
      
      return score;
    } else {
      // Check spelling "WORLD" backwards
      const spellWorld = attention.spellWorld.trim().toLowerCase();
      const correctSpelling = 'dlrow';
      
      if (spellWorld === correctSpelling) {
        return 5;
      } else {
        // Partial credit for getting some letters right
        let score = 0;
        for (let i = 0; i < Math.min(spellWorld.length, correctSpelling.length); i++) {
          if (spellWorld[i] === correctSpelling[i]) {
            score += 1;
          }
        }
        return score;
      }
    }
  };

  const calculateRecallScore = () => {
    const { recall } = formData;
    const requiredWords = ['apple', 'table', 'pen'];
    let score = 0;
    
    // Check each recalled word
    const word1 = recall.word1.trim().toLowerCase();
    const word2 = recall.word2.trim().toLowerCase();
    const word3 = recall.word3.trim().toLowerCase();
    
    if (requiredWords.some(word => word1.includes(word) || word.includes(word1))) {
      score += 1;
    }
    if (requiredWords.some(word => word2.includes(word) || word.includes(word2))) {
      score += 1;
    }
    if (requiredWords.some(word => word3.includes(word) || word.includes(word3))) {
      score += 1;
    }
    
    return score;
  };

  const calculateLanguageScore = () => {
    const { language } = formData;
    let score = 0;
    
    // Object naming (2 points) - already handled by ObjectRecognition component
    if (language.object1.answer.trim()) score += 1;
    if (language.object2.answer.trim()) score += 1;
    
    // Repetition (1 point) - check for correct sentence
    const repetition = language.repetition.trim().toLowerCase();
    const correctSentence = 'no ifs, ands, or buts';
    if (repetition === correctSentence || language.repetitionAudio) {
      score += 1;
    }
    
    // Command (3 points) - check if they completed the task
    const command = language.command.trim().toLowerCase();
    if (command === 'yes' || command === 'y' || command === 'true' || 
        command.includes('completed') || command.includes('done')) {
      score += 3;
    }
    
    // Reading (1 point) - check if they followed instruction
    const reading = language.reading.trim().toLowerCase();
    if (reading === 'yes' || reading === 'y' || reading === 'true' || 
        reading.includes('closed') || reading.includes('eyes')) {
      score += 1;
    }
    
    // Writing (1 point) - check if they wrote a sentence
    const writing = language.writing.trim();
    if (writing && writing.length > 10 && writing.includes(' ')) {
      score += 1;
    }
    
    // Copying (1 point) - check if they completed the drawing
    const copying = language.copying.trim().toLowerCase();
    if (copying === 'yes' || copying === 'y' || copying === 'true' || 
        copying.includes('completed') || copying.includes('done')) {
      score += 1;
    }
    
    return score;
  };

  const calculateTotalScore = () => {
  return (
      calculateOrientationScore() +
      calculateRegistrationScore() +
      calculateAttentionScore() +
      calculateRecallScore() +
      calculateLanguageScore()
    );
  };

  const getInterpretation = (totalScore: number) => {
    if (totalScore >= 24) return "Normal";
    return "Cognitive impairment (suggests further formal testing)";
  };

  const handleNext = () => {
    if (currentSection < 5) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleSaveResults = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      setSaveMessage({ type: 'error', message: 'You must be logged in to save results' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const totalScore = calculateTotalScore();
      const interpretation = getInterpretation(totalScore);

      const response = await fetch('/api/mmse-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orientation: formData.orientation,
          registration: formData.registration,
          attention: formData.attention,
          recall: formData.recall,
          language: formData.language,
          totalScore,
          interpretation
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assessment');
      }

      setSaveMessage({ 
        type: 'success', 
        message: 'Assessment saved successfully! Your results have been recorded.' 
      });

      // Optional: Redirect to a results page or dashboard
      // router.push('/dashboard/patient');

    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save assessment. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">MMSE Assessment</h2>
        <span className="text-lg text-gray-600 dark:text-gray-300">
          Section {currentSection} of {SECTIONS.length}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${(currentSection / SECTIONS.length) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-3">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            className={`text-base ${
              section.id <= currentSection ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {section.title}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrientationSection = () => (
    <ShowcaseSection title="1. Orientation (10 points)" className="space-y-6 !p-6.5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">About Today (5 points)</h4>
          <div className="space-y-4">
            <InputGroup
              label="What year is it?"
              placeholder="Enter the year"
              type="number"
              value={formData.orientation.yearAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('yearAnswer', e.target.value)}
            />
            <InputGroup
              label="What season is it? (e.g., Spring)"
              placeholder="Enter the season"
              type="text"
              value={formData.orientation.seasonAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('seasonAnswer', e.target.value)}
            />
            <InputGroup
              label="What is today's date? (e.g., 2024-04-27)"
              placeholder="Enter the date"
              type="text"
              value={formData.orientation.dateAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('dateAnswer', e.target.value)}
            />
            <InputGroup
              label="What day of the week is it?"
              placeholder="Enter the day (e.g., Monday)"
              type="text"
              value={formData.orientation.dayAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('dayAnswer', e.target.value)}
            />
            <InputGroup
              label="What month is it?"
              placeholder="Enter the month"
              type="text"
              value={formData.orientation.monthAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('monthAnswer', e.target.value)}
            />
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">About Where You Are (5 points)</h4>
          <div className="space-y-4">
            <InputGroup
              label="Which state or province are you in?"
              placeholder="Enter your state or province"
              type="text"
              value={formData.orientation.stateAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('stateAnswer', e.target.value)}
            />
            <InputGroup
              label="Which country are you in?"
              placeholder="Enter your country"
              type="text"
              value={formData.orientation.countryAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('countryAnswer', e.target.value)}
            />
            <InputGroup
              label="What is the name of this building?"
              placeholder="Enter the building name"
              type="text"
              value={formData.orientation.hospitalAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('hospitalAnswer', e.target.value)}
            />
            <InputGroup
              label="Which floor are you on?"
              placeholder="Enter the floor number or name"
              type="text"
              value={formData.orientation.floorAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('floorAnswer', e.target.value)}
            />
            <InputGroup
              label="Which city are you in?"
              placeholder="Enter your city"
              type="text"
              value={formData.orientation.cityAnswer}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('cityAnswer', e.target.value)}
            />
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );

  const renderRegistrationSection = () => (
    <ShowcaseSection title="2. Memory Exercise (3 points)" className="space-y-6 !p-6.5">
      <div className="space-y-4">
        <p className="mb-4 text-gray-600">
          Please remember these three words: <b>Apple</b>, <b>Table</b>, <b>Pen</b>. You will be asked to recall them later.
        </p>
        <InputGroup
          label="Type the three words above to confirm you have read them."
          placeholder="Type here..."
          type="text"
          value={formData.registration.wordsTyped}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegistration('wordsTyped', e.target.value)}
        />
      </div>
    </ShowcaseSection>
  );

  const renderAttentionSection = () => (
    <ShowcaseSection title="3. Attention and Calculation (5 points)" className="space-y-6 !p-6.5">
      <div className="space-y-4">
        <p className="mb-4 text-gray-600">
          Please choose one of the following tasks:
        </p>
        <div className="space-y-2">
          <Checkbox
            label="Subtract 7 from 100, and keep subtracting 7 from each new number, five times."
            onChange={e => updateAttention('useSubtraction', e.target.checked)}
          />
          <Checkbox
            label="Or, spell the word 'WORLD' backwards."
            onChange={e => updateAttention('useSubtraction', !e.target.checked)}
          />
        </div>
        {formData.attention.useSubtraction ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <InputGroup
                key={i}
                label={`What is the result after subtracting 7 (${i === 0 ? 'from 100' : 'again'})?`}
                placeholder="Type your answer"
                type="number"
                value={formData.attention.answers[i]}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newAnswers = [...formData.attention.answers];
                  newAnswers[i] = e.target.value;
                  updateAttention('answers', newAnswers);
                }}
              />
            ))}
          </div>
        ) : (
          <InputGroup
            label="Please spell 'WORLD' backwards."
            placeholder="Type here..."
            type="text"
            value={formData.attention.spellWorld}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAttention('spellWorld', e.target.value)}
          />
        )}
      </div>
          </ShowcaseSection>
  );

  const renderRecallSection = () => (
    <ShowcaseSection title="4. Recall (3 points)" className="space-y-6 !p-6.5">
      <div className="space-y-4">
        <p className="mb-4 text-gray-600">
          Please type the three words you were asked to remember earlier.
        </p>
        <InputGroup
          label="First word"
          placeholder="Type here..."
          type="text"
          value={formData.recall.word1}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRecall('word1', e.target.value)}
        />
        <InputGroup
          label="Second word"
          placeholder="Type here..."
          type="text"
          value={formData.recall.word2}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRecall('word2', e.target.value)}
        />
        <InputGroup
          label="Third word"
          placeholder="Type here..."
          type="text"
          value={formData.recall.word3}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRecall('word3', e.target.value)}
        />
      </div>
          </ShowcaseSection>
  );

  const renderLanguageSection = () => (
    <ShowcaseSection title="5. Language (9 points)" className="space-y-6 !p-6.5">
      <div className="space-y-6">
        {/* Object Recognition - First Object */}
        <ObjectRecognition
          label="What is the name of this object? (Object 1)"
          objectName="object1"
          userAnswer={formData.language.object1.answer}
          onAnswerChange={(objectName, answer) => updateObjectAnswer('object1', objectName, answer)}
        />
        
        {/* Object Recognition - Second Object */}
        <ObjectRecognition
          label="What is the name of this object? (Object 2)"
          objectName="object2"
          userAnswer={formData.language.object2.answer}
          onAnswerChange={(objectName, answer) => updateObjectAnswer('object2', objectName, answer)}
        />
        {/* Voice Recording for Repetition */}
        <VoiceRecorder
          label="Please repeat this sentence: 'No ifs, ands, or buts.'"
          placeholder="Click record to start speaking the sentence..."
          onAudioSave={handleAudioSave}
        />
        
        {/* Audio Recording Status */}
        {formData.language.repetitionAudio && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900 dark:border-green-700">
            <div className="flex items-center">
              <span className="mr-2 text-xl">🎤</span>
              <span className="text-green-800 dark:text-green-200 font-medium">Audio recording saved</span>
            </div>
          </div>
        )}
        
        {/* Text input as backup */}
        <InputGroup
          label="Or type the sentence here (backup option):"
          placeholder="Type the sentence here"
          type="text"
          value={formData.language.repetition}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('repetition', e.target.value)}
        />
        <InputGroup
          label="Follow these steps: 1) Take a piece of paper in your hand, 2) Fold it in half, 3) Put it on the floor. Did you complete all three steps?"
          placeholder="Type 'yes' if you did all three steps"
          type="text"
          value={formData.language.command}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('command', e.target.value)}
        />
        <InputGroup
          label="Read and follow this instruction: 'CLOSE YOUR EYES'. Did you close your eyes?"
          placeholder="Type 'yes' if you did"
          type="text"
          value={formData.language.reading}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('reading', e.target.value)}
        />
        <TextAreaGroup
          label="Please write a sentence of your choice."
          placeholder="Type your sentence here"
          value={formData.language.writing}
          handleChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateLanguage('writing', e.target.value)}
        />
        
        {/* Copying Section with Image and Drawing Canvas */}
        <div className="space-y-4">
          <div>
            <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Copying (1 point)</h4>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Please copy the following shape (two interlocking pentagons):
            </p>
            
            {/* Image Display */}
            <div className="mb-6">
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="text-center text-gray-500 dark:text-gray-300 mb-2">
                  <p className="text-lg font-medium">Reference Image</p>
                </div>
                <div className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded overflow-hidden">
                  <img 
                    src="/images/pantagons.jpg" 
                    alt="Interlocking Pentagons" 
                    className="w-full h-auto max-w-full object-contain"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="mb-4">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                Draw your copy of the interlocking pentagons below:
              </p>
              <div className="flex justify-center">
                <DrawingCanvas
                  width={400}
                  height={300}
                  onSave={handleDrawingSave}
                  className=""
                  responsive={true}
                />
              </div>
              
              {/* Drawing Saved Indicator */}
              {drawingSaved && (
                <div className="mt-2 text-center">
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-base">
                    <span className="mr-1">✓</span>
                    Drawing saved successfully!
                  </div>
                </div>
              )}
              
              {/* Show Saved Drawing */}
              {formData.language.drawingImage && (
                <div className="mt-4">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Your saved drawing:</p>
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <img 
                      src={formData.language.drawingImage} 
                      alt="Saved drawing" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div className="mt-4">
              <InputGroup
                label="Did you complete the drawing?"
                placeholder="Type 'yes' if you completed the drawing"
                type="text"
                value={formData.language.copying}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('copying', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );

  const renderResults = () => {
    const totalScore = calculateTotalScore();
    const interpretation = getInterpretation(totalScore);
    
    return (
      <ShowcaseSection title="MMSE Results" className="space-y-6 !p-6.5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Section Scores</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-lg text-gray-900 dark:text-white">
                  <span>Orientation:</span>
                  <span>{calculateOrientationScore()}/10</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white">
                  <span>Memory:</span>
                  <span>{calculateRegistrationScore()}/3</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white">
                  <span>Attention & Calculation:</span>
                  <span>{calculateAttentionScore()}/5</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white">
                  <span>Recall:</span>
                  <span>{calculateRecallScore()}/3</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white">
                  <span>Language:</span>
                  <span>{calculateLanguageScore()}/9</span>
                </div>
                <hr className="my-3 border-gray-300 dark:border-gray-600" />
                <div className="flex justify-between font-bold text-2xl text-gray-900 dark:text-white">
                  <span>Total Score:</span>
                  <span>{totalScore}/30</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Interpretation</h4>
              <div className={`p-4 rounded-lg ${
                totalScore >= 24 
                  ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
              }`}>
                <p className="font-semibold text-lg">{interpretation}</p>
                <p className="text-base mt-2">
                  {totalScore >= 24 
                    ? "Score indicates normal cognitive function."
                    : "Score suggests cognitive impairment. Further formal testing recommended."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-4 rounded-lg ${
              saveMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' 
                : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
            }`}>
              <p className="font-semibold text-lg">{saveMessage.message}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowResults(false)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg"
            >
              Edit Form
            </button>
            <button
              type="button"
              onClick={handleSaveResults}
              disabled={isSaving}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-lg"
            >
              {isSaving ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        </div>
      </ShowcaseSection>
    );
  };

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-8">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentSection === 1}
        className={`px-8 py-4 rounded-md text-lg font-medium ${
          currentSection === 1
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Previous
      </button>
      
      <button
        type="button"
        onClick={handleNext}
        className="px-8 py-4 bg-green-600 text-white rounded-md hover:bg-green-700 text-lg font-medium"
      >
        {currentSection === 5 ? 'View Results' : 'Next'}
      </button>
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="MMSE Form" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {showResults ? (
          renderResults()
        ) : (
          <>
            {renderProgressBar()}
            
            {currentSection === 1 && renderOrientationSection()}
            {currentSection === 2 && renderRegistrationSection()}
            {currentSection === 3 && renderAttentionSection()}
            {currentSection === 4 && renderRecallSection()}
            {currentSection === 5 && renderLanguageSection()}
            
            {renderNavigation()}
          </>
        )}
      </form>
    </>
  );
}