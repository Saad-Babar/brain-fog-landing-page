"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const ENGLISH_QUESTIONS = {
  orientation: [
    "What year is it?",
    "What season is it?",
    "What is the date?",
    "What day is it?",
    "What month is it?",
    "What state are we in?",
    "What country are we in?",
    "What building are we in?",
    "What floor are we on?",
    "What city are we in?",
  ],
  registration: ["Please type the three words you were asked to remember."],
  attention: [
    "Serial 7s (subtract 7 from 100, then keep subtracting 7)",
    "Spell 'WORLD' backwards",
  ],
  recall: ["Recall the three words you were asked to remember."],
  language: [
    "Name these objects:",
    "Repeat this sentence:",
    "Follow this command:",
    "Read and do:",
    "Write a sentence:",
    "Copy the drawing:",
  ],
};
const URDU_QUESTIONS = {
  orientation: [
    "اب کون سا سال ہے؟",
    "اب کون سا موسم ہے؟",
    "آج کون سی تاریخ ہے؟",
    "آج کون سا دن ہے؟",
    "اب کون سا مہینہ ہے؟",
    "آپ کہاں ہیں؟ (صوبہ)",
    "آپ کہاں ہیں؟ (ملک)",
    "آپ کہاں ہیں؟ (عمارت)",
    "آپ کہاں ہیں؟ (منزل)",
    "آپ کہاں ہیں؟ (شہر)",
  ],
  registration: ["براہ کرم وہ تین الفاظ لکھیں جو آپ کو یاد کرنے کے لیے کہے گئے تھے۔"],
  attention: [
    "سات سات کم کریں (100 میں سے 7 کم کریں، پھر ہر بار 7 کم کریں)",
    "'دنیا' کو الٹا لکھیں",
  ],
  recall: ["وہ تین الفاظ یاد کریں جو آپ کو یاد کرنے کے لیے کہے گئے تھے۔"],
  language: [
    "ان اشیاء کے نام بتائیں:",
    "یہ جملہ دہرائیں:",
    "یہ ہدایت پر عمل کریں:",
    "پڑھیں اور کریں:",
    "ایک جملہ لکھیں:",
    "تصویر کی نقل کریں:",
  ],
};

export default function SharedMMSEPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/share-mmse/${id}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data || !data.assessment) return <div className="p-8">Not found.</div>;

  const { patient, assessment, language } = data;
  const isUrdu = language === "Urdu";
  const questions = isUrdu ? URDU_QUESTIONS : ENGLISH_QUESTIONS;

  // Helper for language section
  function renderLanguageSection(lang: any) {
    if (!lang) return null;
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">{isUrdu ? "زبان" : "Language"}</h2>
        <ul className="list-disc ml-6">
          <li className="mb-1">
            <span className="font-medium">{questions.language[0]}</span> {lang.object1?.name ? `1. ${lang.object1.name}: ${lang.object1.answer}` : null} {lang.object2?.name ? `2. ${lang.object2.name}: ${lang.object2.answer}` : null}
          </li>
          <li className="mb-1">
            <span className="font-medium">{questions.language[1]}</span> {lang.repetition}
            {lang.repetitionAudio && <audio src={lang.repetitionAudio} controls className="mt-2" />}
          </li>
          <li className="mb-1">
            <span className="font-medium">{questions.language[2]}</span> {lang.command}
          </li>
          <li className="mb-1">
            <span className="font-medium">{questions.language[3]}</span> {lang.reading}
          </li>
          <li className="mb-1">
            <span className="font-medium">{questions.language[4]}</span> {lang.writing}
          </li>
          <li className="mb-1">
            <span className="font-medium">{questions.language[5]}</span> {lang.copying}
            {lang.drawingImage && (
              <div className="mt-2">
                <img src={lang.drawingImage} alt="Drawing" className="max-w-xs border rounded" />
              </div>
            )}
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button className="mb-4 text-blue-600 hover:underline" onClick={() => router.back()}>&larr; Back</button>
      <h1 className="text-2xl font-bold mb-2">MMSE Assessment Details</h1>
      <div className="mb-4 p-4 bg-gray-50 rounded border">
        <div><span className="font-semibold">Patient:</span> {patient.firstName} {patient.lastName} ({patient.email})</div>
        <div><span className="font-semibold">Date:</span> {dayjs(assessment.assessmentDate).format("YYYY-MM-DD HH:mm")}</div>
        <div><span className="font-semibold">Language:</span> {language}</div>
        <div><span className="font-semibold">Score:</span> {assessment.totalScore}/30</div>
        <div><span className="font-semibold">Interpretation:</span> {assessment.interpretation}</div>
      </div>
      {/* Show all answers with questions */}
      <div className="space-y-6">
        {/* Orientation */}
        {assessment.orientation && (
          <div>
            <h2 className="text-lg font-semibold mb-2">{isUrdu ? "مکانی اور زمانی آگاہی" : "Orientation"}</h2>
            <ul className="ml-6">
              {questions.orientation.map((q, i) => {
                const answer = Object.values(assessment.orientation)[i];
                return (
                  <li key={i} className="mb-4">
                    <div className="font-bold text-lg mb-1">{q}</div>
                    <div className="text-base"><span className="font-semibold">ANS:</span> {answer}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {/* Registration */}
        {assessment.registration && (
          <div>
            <h2 className="text-lg font-semibold mb-2">{isUrdu ? "یادداشت" : "Registration"}</h2>
            <div className="ml-6 mb-4">
              <div className="font-bold text-lg mb-1">{questions.registration[0]}</div>
              <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.registration.wordsTyped || assessment.registration.words || "-"}</div>
            </div>
          </div>
        )}
        {/* Attention */}
        {assessment.attention && (
          <div>
            <h2 className="text-lg font-semibold mb-2">{isUrdu ? "توجہ اور حساب" : "Attention & Calculation"}</h2>
            <div className="ml-6 mb-4">
              {assessment.attention.answers && Array.isArray(assessment.attention.answers) && assessment.attention.answers.length > 0 ? (
                <>
                  <div className="font-bold text-lg mb-1">{questions.attention[0]}</div>
                  <div className="text-base mb-2"><span className="font-semibold">ANS:</span> {assessment.attention.answers.join(", ")}</div>
                </>
              ) : null}
              {assessment.attention.spellWorld && (
                <>
                  <div className="font-bold text-lg mb-1">{questions.attention[1]}</div>
                  <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.attention.spellWorld}</div>
                </>
              )}
            </div>
          </div>
        )}
        {/* Recall */}
        {assessment.recall && (
          <div>
            <h2 className="text-lg font-semibold mb-2">{isUrdu ? "یاد آنا" : "Recall"}</h2>
            <div className="ml-6 mb-4">
              <div className="font-bold text-lg mb-1">{questions.recall[0]}</div>
              <div className="text-base"><span className="font-semibold">ANS:</span></div>
              {assessment.recall.word1 && <div className="ml-4">1. {assessment.recall.word1}</div>}
              {assessment.recall.word2 && <div className="ml-4">2. {assessment.recall.word2}</div>}
              {assessment.recall.word3 && <div className="ml-4">3. {assessment.recall.word3}</div>}
            </div>
          </div>
        )}
        {/* Language */}
        {assessment.language && (
          <div>
            <h2 className="text-lg font-semibold mb-2">{isUrdu ? "زبان" : "Language"}</h2>
            <ul className="ml-6">
              <li className="mb-4">
                <div className="font-bold text-lg mb-1">{questions.language[0]}</div>
                <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.language.object1?.name ? `1. ${assessment.language.object1.name}: ${assessment.language.object1.answer}` : null} {assessment.language.object2?.name ? `2. ${assessment.language.object2.name}: ${assessment.language.object2.answer}` : null}</div>
              </li>
              <li className="mb-4">
                <div className="font-bold text-lg mb-1">{questions.language[1]}</div>
                <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.language.repetition}</div>
                {assessment.language.repetitionAudio && <audio src={assessment.language.repetitionAudio} controls className="mt-2" />}
              </li>
              <li className="mb-4">
                <div className="font-bold text-lg mb-1">{questions.language[2]}</div>
                <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.language.command}</div>
              </li>
              <li className="mb-4">
                <div className="font-bold text-lg mb-1">{questions.language[3]}</div>
                <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.language.reading}</div>
              </li>
              <li className="mb-4">
                <div className="font-bold text-lg mb-1">{questions.language[4]}</div>
                <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.language.writing}</div>
              </li>
              <li className="mb-4">
                <div className="font-bold text-lg mb-1">{questions.language[5]}</div>
                <div className="text-base"><span className="font-semibold">ANS:</span> {assessment.language.copying}</div>
                {assessment.language.drawingImage && (
                  <div className="mt-2">
                    <img src={assessment.language.drawingImage} alt="Drawing" className="max-w-xs border rounded" />
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 