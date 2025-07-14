"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";

// Types
interface MMSEAssessmentSection {
  [key: string]: any;
}
interface MMSEAssessment {
  _id?: string;
  userId?: string;
  assessmentDate: string;
  totalScore: number;
  interpretation: string;
  language: string;
  drawingImage?: string;
  orientation?: MMSEAssessmentSection;
  registration?: MMSEAssessmentSection;
  attention?: MMSEAssessmentSection;
  recall?: MMSEAssessmentSection;
  languageSection?: MMSEAssessmentSection; // for English/Urdu
  [key: string]: any;
}

const ENGLISH_LABELS = {
  orientation: "Orientation",
  registration: "Registration",
  attention: "Attention & Calculation",
  recall: "Recall",
  language: "Language",
};
const URDU_LABELS = {
  orientation: "مکانی اور زمانی آگاہی",
  registration: "یادداشت",
  attention: "توجہ اور حساب",
  recall: "یاد آنا",
  language: "زبان",
};

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const [assessments, setAssessments] = useState<MMSEAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MMSEAssessment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareAssessment, setShareAssessment] = useState<MMSEAssessment | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState("");
  const [shareError, setShareError] = useState("");

  // Fetch doctors when share modal opens
  useEffect(() => {
    if (shareModalOpen) {
      setDoctors([]);
      setShareError("");
      setShareSuccess("");
      setShareLoading(true);
      fetch("/api/users?role=doctor&isActive=true")
        .then(r => r.json())
        .then(data => setDoctors(data.users || []))
        .catch(() => setShareError("Failed to load doctors."))
        .finally(() => setShareLoading(false));
    }
  }, [shareModalOpen]);

  const handleShare = async () => {
    if (!selectedDoctor || !shareAssessment) return;
    setShareLoading(true);
    setShareError("");
    setShareSuccess("");
    // Placeholder API call
    const res = await fetch("/api/share-mmse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentId: shareAssessment._id,
        doctorId: selectedDoctor,
      }),
    });
    if (res.ok) {
      setShareSuccess("Test shared successfully!");
      setShareAssessment(null);
      setSelectedDoctor("");
      setTimeout(() => setShareModalOpen(false), 1200);
    } else {
      setShareError("Failed to share test.");
    }
    setShareLoading(false);
  };

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    Promise.all([
      fetch("/api/mmse-assessment").then(r => r.json()),
      fetch("/api/mmse-assessment-urdu").then(r => r.json()),
    ]).then(([en, ur]) => {
      const enList = (en.assessments || []).map((a: any) => ({ ...a, language: "English" }));
      const urList = (ur.assessments || []).map((a: any) => ({ ...a, language: "Urdu" }));
      setAssessments([...enList, ...urList].sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()));
    }).finally(() => setLoading(false));
  }, [session?.user]);

  // Type guard for role
  const userRole = (session?.user && typeof session.user === 'object' && 'role' in session.user) ? (session.user as any).role : undefined;

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }
  if (!session?.user || userRole !== "patient") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>
      <p className="mb-8">Welcome! Here you can view your details and test results.</p>
      <div>
        <h2 className="text-xl font-semibold mb-2">Your MMSE Forms</h2>
        {assessments.length === 0 ? (
          <div>No forms found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Language</th>
                  <th className="px-4 py-2 border">Score</th>
                  <th className="px-4 py-2 border">View</th>
                  <th className="px-4 py-2 border">Send to Doctor</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, i) => (
                  <tr key={a._id || i} className="border-b">
                    <td className="px-4 py-2 border">{dayjs(a.assessmentDate).format("YYYY-MM-DD HH:mm")}</td>
                    <td className="px-4 py-2 border">{a.language}</td>
                    <td className="px-4 py-2 border">{a.totalScore}/30</td>
                    <td className="px-4 py-2 border">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => { setSelected(a); setModalOpen(true); }}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => { setShareAssessment(a); setShareModalOpen(true); }}
                      >
                        Send to Doctor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal */}
      {modalOpen && selected && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white max-w-2xl w-full rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh] mt-32"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-2">MMSE Form ({selected.language})</h3>
            <div className="mb-2 text-gray-600 text-sm">Date: {dayjs(selected.assessmentDate).format("YYYY-MM-DD HH:mm")}</div>
            <div className="mb-2 text-gray-600 text-sm">Score: {selected.totalScore}/30</div>
            <div className="mb-2 text-gray-600 text-sm">Interpretation: {selected.interpretation}</div>
            <div className="divide-y divide-gray-200 mt-4">
              {Object.entries(selected).map(([section, value]) => {
                if (["_id", "userId", "assessmentDate", "totalScore", "interpretation", "language", "__v", "drawingImage"].includes(section)) return null;
                if (typeof value !== "object" || value === null) return null;
                const labels = selected.language === "Urdu" ? URDU_LABELS : ENGLISH_LABELS;
                return (
                  <div key={section} className="py-3">
                    <div className="font-semibold mb-1">{(labels as any)[section] || section}</div>
                    <ul className="list-disc ml-6">
                      {Object.entries(value).map(([k, v]) => (
                        k === "score" ? null : (
                          <li key={k} className="mb-1">
                            <span className="font-medium">{k}:</span> {typeof v === "string" ? v : JSON.stringify(v)}
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                );
              })}
              {selected.drawingImage && (
                <div className="py-3">
                  <div className="font-semibold mb-1">Drawing</div>
                  <img src={selected.drawingImage} alt="Drawing" className="max-w-xs border rounded" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Share to Doctor Modal */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="bg-white max-w-lg w-full rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh] mt-32"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShareModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Send Test to Doctor</h3>
            {shareLoading ? (
              <div>Loading...</div>
            ) : shareSuccess ? (
              <div className="text-green-600 font-semibold mb-2">{shareSuccess}</div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Select Doctor:</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={selectedDoctor}
                    onChange={e => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {doctors.map((doc: any) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.firstName} {doc.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                {shareError && <div className="text-red-600 mb-2">{shareError}</div>}
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={!selectedDoctor || shareLoading}
                  onClick={handleShare}
                >
                  Share
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 