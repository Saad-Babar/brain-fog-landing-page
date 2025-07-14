"use client";

import { useState } from "react";
import { useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Checkbox } from "@/components/FormElements/checkbox";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { useSession } from "next-auth/react";
import DrawingCanvas from "@/components/DrawingCanvas";
import ObjectRecognition from "@/components/ObjectRecognition";
import VoiceRecorder from "@/components/VoiceRecorder";

interface MMSEFormDataUrdu {
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
  { id: 1, title: "مکانی اور زمانی آگاہی", points: 10 },
  { id: 2, title: "یادداشت", points: 3 },
  { id: 3, title: "توجہ اور حساب", points: 5 },
  { id: 4, title: "یاد آنا", points: 3 },
  { id: 5, title: "زبان", points: 9 },
];

export default function MMSEFormUrduPage() {
  const { data: session } = useSession();
  
  // Add Urdu font styles specifically for this page
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .urdu-font {
        font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Alvi Nastaleeq", serif;
      }
      
      .urdu-text {
        font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Alvi Nastaleeq", serif;
        font-size: 1.2em;
        line-height: 1.8;
      }
      
      .urdu-display {
        font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Alvi Nastaleeq", serif;
        font-size: 1.2em;
        line-height: 1.8;
        direction: rtl;
        text-align: right;
      }
      
      .urdu-heading {
        font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Alvi Nastaleeq", serif;
        font-size: 1.4em;
        line-height: 1.6;
        direction: rtl;
        text-align: right;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<MMSEFormDataUrdu>({
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
      audioSaved.textContent = '✓ آڈیو ریکارڈ ہو گئی!';
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
    const yearAnswer = orientation.yearAnswer.trim();
    if (yearAnswer === currentYear.toString() || 
        yearAnswer === (currentYear - 1).toString() || 
        yearAnswer === (currentYear + 1).toString()) {
      score += 1;
    }
    
    const seasonAnswer = orientation.seasonAnswer.trim();
    if (seasonAnswer === currentSeason || 
        seasonAnswer === 'گرمی' || seasonAnswer === 'سردی' || 
        seasonAnswer === 'بہار' || seasonAnswer === 'خزاں') {
      score += 1;
    }
    
    const dateAnswer = orientation.dateAnswer.trim();
    if (dateAnswer && dateAnswer.length > 0) {
      score += 1;
    }
    
    const dayAnswer = orientation.dayAnswer.trim();
    if (dayAnswer === currentDay || 
        dayAnswer === 'پیر' || dayAnswer === 'منگل' || 
        dayAnswer === 'بدھ' || dayAnswer === 'جمعرات' || 
        dayAnswer === 'جمعہ' || dayAnswer === 'ہفتہ' || 
        dayAnswer === 'اتوار') {
      score += 1;
    }
    
    const monthAnswer = orientation.monthAnswer.trim();
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
    const stateAnswer = orientation.stateAnswer.trim();
    if (stateAnswer && stateAnswer.length > 2) {
      score += 1;
    }
    
    const countryAnswer = orientation.countryAnswer.trim();
    if (countryAnswer === 'پاکستان' || countryAnswer === 'پاک' || 
        countryAnswer && countryAnswer.length > 2) {
      score += 1;
    }
    
    const hospitalAnswer = orientation.hospitalAnswer.trim();
    if (hospitalAnswer && hospitalAnswer.length > 2) {
      score += 1;
    }
    
    const floorAnswer = orientation.floorAnswer.trim();
    if (floorAnswer && (floorAnswer.includes('منزل') || 
        floorAnswer.includes('فلور') || floorAnswer.includes('زمین') ||
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
    const wordsTyped = registration.wordsTyped.trim();
    
    // Check if all three required words are present (Urdu words)
    const requiredWords = ['سیب', 'میز', 'قلم'];
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
      // Check spelling "دنیا" backwards (should be "آیند")
      const spellWorld = attention.spellWorld.trim();
      const correctSpelling = 'آیند';
      
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
    const requiredWords = ['سیب', 'میز', 'قلم'];
    let score = 0;
    
    // Check each recalled word
    const word1 = recall.word1.trim();
    const word2 = recall.word2.trim();
    const word3 = recall.word3.trim();
    
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
    
    // Repetition (1 point) - check for correct sentence in Urdu
    const repetition = language.repetition.trim();
    const correctSentence = 'نہ اگر، نہ اور، نہ لیکن';
    if (repetition === correctSentence || language.repetitionAudio) {
      score += 1;
    }
    
    // Command (3 points) - check if they completed the task
    const command = language.command.trim();
    if (command === 'ہاں' || command === 'جی ہاں' || command === 'ہاں' || 
        command.includes('مکمل') || command.includes('کر لیا')) {
      score += 3;
    }
    
    // Reading (1 point) - check if they followed instruction
    const reading = language.reading.trim();
    if (reading === 'ہاں' || reading === 'جی ہاں' || reading === 'ہاں' || 
        reading.includes('بند') || reading.includes('آنکھیں')) {
      score += 1;
    }
    
    // Writing (1 point) - check if they wrote a sentence in Urdu
    const writing = language.writing.trim();
    if (writing && writing.length > 10 && writing.includes(' ')) {
      score += 1;
    }
    
    // Copying (1 point) - check if they completed the drawing
    const copying = language.copying.trim();
    if (copying === 'ہاں' || copying === 'جی ہاں' || copying === 'ہاں' || 
        copying.includes('مکمل') || copying.includes('کر لیا')) {
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
    if (totalScore >= 24) return "نارمل";
    return "ذہنی کمزوری (مزید ٹیسٹ کی ضرورت)";
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

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleSaveResults = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      setSaveMessage({ type: 'error', message: 'آپ کو لاگ ان ہونا ضروری ہے' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const totalScore = calculateTotalScore();
      const interpretation = getInterpretation(totalScore);

      const response = await fetch('/api/mmse-assessment-urdu', {
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
        throw new Error(data.error || 'محفوظ کرنے میں ناکام');
      }

      setSaveMessage({ 
        type: 'success', 
        message: 'ٹیسٹ کامیابی سے محفوظ ہو گیا! آپ کے نتائج ریکارڈ کر لیے گئے ہیں۔' 
      });

    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'محفوظ کرنے میں ناکام۔ دوبارہ کوشش کریں۔' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white urdu-heading">ذہنی حالت کا ٹیسٹ</h2>
        <span className="text-lg text-gray-600 dark:text-gray-300 urdu-display">
          حصہ {currentSection} از {SECTIONS.length}
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
            className={`text-base urdu-display ${
              section.id <= currentSection ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {section.title}
          </div>
        ))}
      </div>
    </div>
  );

  const Stepper = () => (
    <div className="hidden lg:flex flex-col items-end sticky top-24 h-fit bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 urdu-font ml-8">
      {SECTIONS.map((section, idx) => (
        <div
          key={section.id}
          className={`flex items-center mb-6 last:mb-0 transition-all ${
            currentSection === section.id
              ? 'bg-blue-100 dark:bg-blue-900 border-r-4 border-blue-600 pr-4' 
              : 'pr-4'
          }`}
        >
          <div className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold mr-3 ${
            currentSection === section.id
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}>
            {section.id}
          </div>
          <span className={`urdu-display text-lg ${currentSection === section.id ? 'font-bold text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{section.title}</span>
        </div>
      ))}
    </div>
  );

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 mb-10 border border-gray-200 dark:border-gray-700 urdu-font">
      {children}
    </div>
  );

  const renderOrientationSection = () => (
    <SectionCard>
      <ShowcaseSection title="1. مکانی اور زمانی آگاہی (10 پوائنٹس)" className="space-y-6 !p-6.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-4 urdu-heading">آج کے بارے میں (5 پوائنٹس)</h4>
            <div className="space-y-4">
              <InputGroup
                label="اب کون سا سال ہے؟"
                placeholder="سال لکھیں"
                type="number"
                value={formData.orientation.yearAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('yearAnswer', e.target.value)}
              />
              <InputGroup
                label="اب کون سا موسم ہے؟"
                placeholder="موسم لکھیں"
                type="text"
                value={formData.orientation.seasonAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('seasonAnswer', e.target.value)}
              />
              <InputGroup
                label="آج کون سی تاریخ ہے؟"
                placeholder="تاریخ لکھیں"
                type="text"
                value={formData.orientation.dateAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('dateAnswer', e.target.value)}
              />
              <InputGroup
                label="آج کون سا دن ہے؟"
                placeholder="دن لکھیں"
                type="text"
                value={formData.orientation.dayAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('dayAnswer', e.target.value)}
              />
              <InputGroup
                label="اب کون سا مہینہ ہے؟"
                placeholder="مہینہ لکھیں"
                type="text"
                value={formData.orientation.monthAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('monthAnswer', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 urdu-heading">مقام کے بارے میں (5 پوائنٹس)</h4>
            <div className="space-y-4">
              <InputGroup
                label="آپ کہاں ہیں؟ (صوبہ)"
                placeholder="صوبہ لکھیں"
                type="text"
                value={formData.orientation.stateAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('stateAnswer', e.target.value)}
              />
              <InputGroup
                label="آپ کہاں ہیں؟ (ملک)"
                placeholder="ملک لکھیں"
                type="text"
                value={formData.orientation.countryAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('countryAnswer', e.target.value)}
              />
              <InputGroup
                label="آپ کہاں ہیں؟ (عمارت)"
                placeholder="عمارت لکھیں"
                type="text"
                value={formData.orientation.hospitalAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('hospitalAnswer', e.target.value)}
              />
              <InputGroup
                label="آپ کہاں ہیں؟ (منزل)"
                placeholder="منزل لکھیں"
                type="text"
                value={formData.orientation.floorAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('floorAnswer', e.target.value)}
              />
              <InputGroup
                label="آپ کہاں ہیں؟ (شہر)"
                placeholder="شہر لکھیں"
                type="text"
                value={formData.orientation.cityAnswer}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrientation('cityAnswer', e.target.value)}
              />
            </div>
          </div>
        </div>
      </ShowcaseSection>
    </SectionCard>
  );

  const renderRegistrationSection = () => (
    <SectionCard>
      <ShowcaseSection title="2. یادداشت کا مشق (3 پوائنٹس)" className="space-y-6 !p-6.5">
        <div className="space-y-4">
          <p className="mb-4 text-gray-600 dark:text-gray-300 text-lg urdu-text">
            براہ کرم ان تین الفاظ کو یاد رکھیں: <b>سیب</b>، <b>میز</b>، <b>قلم</b>۔ آپ سے بعد میں انہیں یاد کرنے کو کہا جائے گا۔
          </p>
          <InputGroup
            label="اوپر کے تین الفاظ لکھ کر تصدیق کریں کہ آپ نے انہیں پڑھ لیا ہے۔"
            placeholder="یہاں لکھیں..."
            type="text"
            value={formData.registration.wordsTyped}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegistration('wordsTyped', e.target.value)}
          />
        </div>
      </ShowcaseSection>
    </SectionCard>
  );

  const renderAttentionSection = () => (
    <SectionCard>
      <ShowcaseSection title="3. توجہ اور حساب (5 پوائنٹس)" className="space-y-6 !p-6.5">
        <div className="space-y-4">
          <div className="mb-4">
            <Checkbox
              label="100 سے 7 گھٹائیں (5 بار)"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAttention('useSubtraction', e.target.checked)}
            />
          </div>
          
          {formData.attention.useSubtraction ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-300 urdu-text">
                100 سے 7 گھٹائیں اور ہر جواب لکھیں:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  label="100 - 7 ="
                  placeholder="جواب لکھیں"
                  type="number"
                  value={formData.attention.answers[0]}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newAnswers = [...formData.attention.answers];
                    newAnswers[0] = e.target.value;
                    updateAttention('answers', newAnswers);
                  }}
                />
                <InputGroup
                  label="93 - 7 ="
                  placeholder="جواب لکھیں"
                  type="number"
                  value={formData.attention.answers[1]}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newAnswers = [...formData.attention.answers];
                    newAnswers[1] = e.target.value;
                    updateAttention('answers', newAnswers);
                  }}
                />
                <InputGroup
                  label="86 - 7 ="
                  placeholder="جواب لکھیں"
                  type="number"
                  value={formData.attention.answers[2]}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newAnswers = [...formData.attention.answers];
                    newAnswers[2] = e.target.value;
                    updateAttention('answers', newAnswers);
                  }}
                />
                <InputGroup
                  label="79 - 7 ="
                  placeholder="جواب لکھیں"
                  type="number"
                  value={formData.attention.answers[3]}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newAnswers = [...formData.attention.answers];
                    newAnswers[3] = e.target.value;
                    updateAttention('answers', newAnswers);
                  }}
                />
                <InputGroup
                  label="72 - 7 ="
                  placeholder="جواب لکھیں"
                  type="number"
                  value={formData.attention.answers[4]}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newAnswers = [...formData.attention.answers];
                    newAnswers[4] = e.target.value;
                    updateAttention('answers', newAnswers);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-300 urdu-text">
                "دنیا" کو الٹا ہجے کریں:
              </p>
              <InputGroup
                label="دنیا کا الٹا ہجہ"
                placeholder="الٹا ہجہ لکھیں"
                type="text"
                value={formData.attention.spellWorld}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAttention('spellWorld', e.target.value)}
              />
            </div>
          )}
        </div>
      </ShowcaseSection>
    </SectionCard>
  );

  const renderRecallSection = () => (
    <SectionCard>
      <ShowcaseSection title="4. یاد آنا (3 پوائنٹس)" className="space-y-6 !p-6.5">
        <div className="space-y-4">
          <p className="mb-4 text-gray-600 dark:text-gray-300 text-lg urdu-text">
            براہ کرم وہ تین الفاظ لکھیں جو آپ سے پہلے یاد رکھنے کو کہا گیا تھا۔
          </p>
          <InputGroup
            label="پہلا لفظ"
            placeholder="لفظ لکھیں"
            type="text"
            value={formData.recall.word1}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRecall('word1', e.target.value)}
          />
          <InputGroup
            label="دوسرا لفظ"
            placeholder="لفظ لکھیں"
            type="text"
            value={formData.recall.word2}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRecall('word2', e.target.value)}
          />
          <InputGroup
            label="تیسرا لفظ"
            placeholder="لفظ لکھیں"
            type="text"
            value={formData.recall.word3}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRecall('word3', e.target.value)}
          />
        </div>
      </ShowcaseSection>
    </SectionCard>
  );

  const renderLanguageSection = () => (
    <SectionCard>
      <ShowcaseSection title="5. زبان (9 پوائنٹس)" className="space-y-6 !p-6.5">
        <div className="space-y-6">
          {/* Object Recognition - First Object */}
          <ObjectRecognition
            label="اس چیز کا نام کیا ہے؟ (چیز 1)"
            objectName="object1"
            userAnswer={formData.language.object1.answer}
            onAnswerChange={(objectName, answer) => updateObjectAnswer('object1', objectName, answer)}
          />
          
          {/* Object Recognition - Second Object */}
          <ObjectRecognition
            label="اس چیز کا نام کیا ہے؟ (چیز 2)"
            objectName="object2"
            userAnswer={formData.language.object2.answer}
            onAnswerChange={(objectName, answer) => updateObjectAnswer('object2', objectName, answer)}
          />
          
          {/* Voice Recording for Repetition */}
          <VoiceRecorder
            label="براہ کرم یہ جملہ دہرائیں: 'نہ اگر، نہ اور، نہ لیکن'"
            placeholder="جملہ بولنے کے لیے ریکارڈ کریں..."
            onAudioSave={handleAudioSave}
          />
          
          {/* Audio Recording Status */}
          {formData.language.repetitionAudio && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900 dark:border-green-700">
              <div className="flex items-center">
                <span className="mr-2 text-xl">🎤</span>
                <span className="text-green-800 dark:text-green-200 font-medium urdu-text">آڈیو ریکارڈ محفوظ ہو گئی</span>
              </div>
            </div>
          )}
          
          {/* Text input as backup */}
          <InputGroup
            label="یا یہاں جملہ لکھیں (متبادل آپشن):"
            placeholder="جملہ یہاں لکھیں"
            type="text"
            value={formData.language.repetition}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('repetition', e.target.value)}
          />
          
          <InputGroup
            label="یہ تین کام کریں: 1) کاغذ ہاتھ میں لیں، 2) اسے آدھا موڑیں، 3) زمین پر رکھیں۔ کیا آپ نے تینوں کام مکمل کیے؟"
            placeholder="ہاں لکھیں اگر آپ نے تینوں کام کیے"
            type="text"
            value={formData.language.command}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('command', e.target.value)}
          />
          
          <InputGroup
            label="یہ ہدایت پڑھیں اور عمل کریں: 'اپنی آنکھیں بند کریں'۔ کیا آپ نے آنکھیں بند کیں؟"
            placeholder="ہاں لکھیں اگر آپ نے کیں"
            type="text"
            value={formData.language.reading}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('reading', e.target.value)}
          />
          
          <TextAreaGroup
            label="براہ کرم اپنی پسند کا ایک جملہ لکھیں۔"
            placeholder="اپنا جملہ یہاں لکھیں"
            value={formData.language.writing}
            handleChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateLanguage('writing', e.target.value)}
          />
          
          {/* Copying Section with Image and Drawing Canvas */}
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white urdu-heading">کاپی کرنا (1 پوائنٹ)</h4>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 urdu-text">
                براہ کرم یہ شکل کاپی کریں (دو ملے ہوئے پنجے):
              </p>
              
              {/* Image Display */}
              <div className="mb-6">
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="text-center text-gray-500 dark:text-gray-300 mb-2">
                    <p className="text-lg font-medium urdu-text">حوالہ تصویر</p>
                  </div>
                  <div className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded overflow-hidden">
                    <img 
                      src="/images/pantagons.jpg" 
                      alt="ملے ہوئے پنجے" 
                      className="w-full h-auto max-w-full object-contain"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="mb-4">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 urdu-text">
                  نیچے ملے ہوئے پنجوں کی اپنی کاپی بنائیں:
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
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-base urdu-text">
                      <span className="mr-1">✓</span>
                      تصویر کامیابی سے محفوظ ہو گئی!
                    </div>
                  </div>
                )}
                
                {/* Show Saved Drawing */}
                {formData.language.drawingImage && (
                  <div className="mt-4">
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 urdu-text">آپ کی محفوظ تصویر:</p>
                    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img 
                        src={formData.language.drawingImage} 
                        alt="محفوظ تصویر" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div className="mt-4">
                <InputGroup
                  label="کیا آپ نے تصویر مکمل کی؟"
                  placeholder="ہاں لکھیں اگر آپ نے تصویر مکمل کی"
                  type="text"
                  value={formData.language.copying}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLanguage('copying', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </ShowcaseSection>
    </SectionCard>
  );

  const renderResults = () => {
    const totalScore = calculateTotalScore();
    const interpretation = getInterpretation(totalScore);
    
    return (
      <ShowcaseSection title="ٹیسٹ کے نتائج" className="space-y-6 !p-6.5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white urdu-heading">حصوں کے پوائنٹس</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-lg text-gray-900 dark:text-white urdu-text">
                  <span>مکانی اور زمانی آگاہی:</span>
                  <span>{calculateOrientationScore()}/10</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white urdu-text">
                  <span>یادداشت:</span>
                  <span>{calculateRegistrationScore()}/3</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white urdu-text">
                  <span>توجہ اور حساب:</span>
                  <span>{calculateAttentionScore()}/5</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white urdu-text">
                  <span>یاد آنا:</span>
                  <span>{calculateRecallScore()}/3</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900 dark:text-white urdu-text">
                  <span>زبان:</span>
                  <span>{calculateLanguageScore()}/9</span>
                </div>
                <hr className="my-3 border-gray-300 dark:border-gray-600" />
                <div className="flex justify-between font-bold text-2xl text-gray-900 dark:text-white urdu-heading">
                  <span>کل پوائنٹس:</span>
                  <span>{totalScore}/30</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white urdu-heading">تشریح</h4>
              <div className={`p-4 rounded-lg ${
                totalScore >= 24 
                  ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
              }`}>
                <p className="font-semibold text-lg urdu-text">{interpretation}</p>
                <p className="text-base mt-2 urdu-text">
                  {totalScore >= 24 
                    ? "پوائنٹس نارمل ذہنی حالت کی نشاندہی کرتے ہیں۔"
                    : "پوائنٹس ذہنی کمزوری کی نشاندہی کرتے ہیں۔ مزید ٹیسٹ کی ضرورت ہے۔"
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
              <p className="font-semibold text-lg urdu-text">{saveMessage.message}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowResults(false)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg urdu-text"
            >
              فارم میں ترمیم
            </button>
            <button
              type="button"
              onClick={handleSaveResults}
              disabled={isSaving}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-lg urdu-text"
            >
              {isSaving ? 'محفوظ ہو رہا ہے...' : 'نتائج محفوظ کریں'}
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
        className={`px-8 py-4 rounded-md text-lg font-medium urdu-text ${
          currentSection === 1
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        پچھلا
      </button>
      
      <button
        type="button"
        onClick={currentSection === 5 ? handleSubmit : handleNext}
        className="px-8 py-4 bg-green-600 text-white rounded-md hover:bg-green-700 text-lg font-medium urdu-text"
      >
        {currentSection === 5 ? 'نتائج دیکھیں' : 'اگلا'}
      </button>
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="ذہنی حالت کا ٹیسٹ - اردو" />
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row-reverse gap-8">
        {/* Stepper Navigation */}
        <Stepper />
        {/* Main Form Content */}
        <div className="flex-1">
          {renderProgressBar()}
          <div className="space-y-8">
            {!showResults ? (
              <>
                {currentSection === 1 && renderOrientationSection()}
                {currentSection === 2 && renderRegistrationSection()}
                {currentSection === 3 && renderAttentionSection()}
                {currentSection === 4 && renderRecallSection()}
                {currentSection === 5 && renderLanguageSection()}
                {renderNavigation()}
              </>
            ) : (
              renderResults()
            )}
          </div>
        </div>
      </div>
    </>
  );
}