"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import Link from "next/link";

interface SharedMMSE {
  _id: string;
  sharedAt: string;
  language: string;
  patient: { firstName: string; lastName: string; email: string };
  assessment: {
    _id: string;
    assessmentDate: string;
    totalScore: number;
    interpretation: string;
    language: string;
  } | null;
}

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const [shared, setShared] = useState<SharedMMSE[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SharedMMSE | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    fetch("/api/share-mmse")
      .then(r => r.json())
      .then(data => setShared(data.shared || []))
      .finally(() => setLoading(false));
  }, [session?.user]);

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }
  // Type guard for role
  const userRole = (session?.user && typeof session.user === 'object' && 'role' in session.user) ? (session.user as any).role : undefined;
  if (!session?.user || userRole !== "doctor") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      <p className="mb-8">Welcome! Here you can manage patients and view all test results.</p>
      <div>
        <h2 className="text-xl font-semibold mb-2">MMSE Results Shared With You</h2>
        {shared.length === 0 ? (
          <div>No results shared with you yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Patient</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Language</th>
                  <th className="px-4 py-2 border">Score</th>
                  <th className="px-4 py-2 border">View</th>
                </tr>
              </thead>
              <tbody>
                {shared.map((s) => (
                  <tr key={s._id} className="border-b">
                    <td className="px-4 py-2 border">{s.patient.firstName} {s.patient.lastName}</td>
                    <td className="px-4 py-2 border">{s.assessment ? dayjs(s.assessment.assessmentDate).format("YYYY-MM-DD HH:mm") : "-"}</td>
                    <td className="px-4 py-2 border">{s.language}</td>
                    <td className="px-4 py-2 border">{s.assessment ? `${s.assessment.totalScore}/30` : "-"}</td>
                    <td className="px-4 py-2 border">
                      <Link
                        href={`/dashboard/admin/shared-mmse/${s._id}`}
                        className={`px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 ${!s.assessment ? 'pointer-events-none opacity-50' : ''}`}
                        tabIndex={!s.assessment ? -1 : 0}
                        aria-disabled={!s.assessment}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal */}
      {modalOpen && selected && selected.assessment && (
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
            <div className="mb-2 text-gray-600 text-sm">Patient: {selected.patient.firstName} {selected.patient.lastName} ({selected.patient.email})</div>
            <div className="mb-2 text-gray-600 text-sm">Date: {dayjs(selected.assessment.assessmentDate).format("YYYY-MM-DD HH:mm")}</div>
            <div className="mb-2 text-gray-600 text-sm">Score: {selected.assessment.totalScore}/30</div>
            <div className="mb-2 text-gray-600 text-sm">Interpretation: {selected.assessment.interpretation}</div>
          </div>
        </div>
      )}
    </div>
  );
} 