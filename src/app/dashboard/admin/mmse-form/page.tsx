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

  const calculateOrientationScore = () => {
    const { orientation } = formData;
    let score = 0;
    
    // Simple scoring based on whether answers are provided
    if (orientation.yearAnswer.trim()) score += 1;
    if (orientation.seasonAnswer.trim()) score += 1;
    if (orientation.dateAnswer.trim()) score += 1;
    if (orientation.dayAnswer.trim()) score += 1;
    if (orientation.monthAnswer.trim()) score += 1;
    if (orientation.stateAnswer.trim()) score += 1;
    if (orientation.countryAnswer.trim()) score += 1;
    if (orientation.hospitalAnswer.trim()) score += 1;
    if (orientation.floorAnswer.trim()) score += 1;
    if (orientation.cityAnswer.trim()) score += 1;
    
    return score;
  };

  const calculateRegistrationScore = () => {
    const { registration } = formData;
    return registration.wordsTyped.trim() ? 3 : 0;
  };

  const calculateAttentionScore = () => {
    const { attention } = formData;
    if (attention.useSubtraction) {
      return attention.answers.filter(answer => answer.trim() !== "").length;
    } else {
      return attention.spellWorld.trim() ? 5 : 0;
    }
  };

  const calculateRecallScore = () => {
    const { recall } = formData;
    let score = 0;
    if (recall.word1.trim()) score += 1;
    if (recall.word2.trim()) score += 1;
    if (recall.word3.trim()) score += 1;
    return score;
  };

  const calculateLanguageScore = () => {
    const { language } = formData;
    let score = 0;
    
    // Object naming (2 points)
    if (language.object1.answer.trim()) score += 1;
    if (language.object2.answer.trim()) score += 1;
    
    // Repetition (1 point)
    if (language.repetition.trim()) score += 1;
    
    // Command (3 points)
    if (language.command.trim()) score += 3;
    
    // Reading (1 point)
    if (language.reading.trim()) score += 1;
    
    // Writing (1 point)
    if (language.writing.trim()) score += 1;
    
    // Copying (1 point)
    if (language.copying.trim()) score += 1;
    
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
        <InputGroup
          label="Please repeat this sentence: 'No ifs, ands, or buts.'"
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