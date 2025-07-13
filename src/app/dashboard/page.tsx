"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-dark dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-dark-2 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-dark dark:text-white">
                  Welcome, {session.user?.firstName}!
                </h1>
                <p className="text-dark-6 dark:text-dark-4 mt-2">
                  Your Brain Fog Monitor Dashboard
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Medical Profile Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-dark-2">
              <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
                Medical Profile
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  <span className="font-medium">Email:</span> {session.user?.email}
                </p>
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  <span className="font-medium">Name:</span> {session.user?.firstName} {session.user?.lastName}
                </p>
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  <span className="font-medium">Status:</span> Active
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-dark-2">
              <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                  Take Brain Fog Assessment
                </button>
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  Anxiety Screening
                </button>
                <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                  View Health Reports
                </button>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-dark-2">
              <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                <div className="text-sm text-dark-6 dark:text-dark-4">
                  <p>• Account created successfully</p>
                  <p>• Welcome to Brain Fog Monitor</p>
                  <p>• Ready for your first assessment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-dark-2 mt-6">
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
              🚀 Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-stroke dark:border-dark-3 rounded-lg p-4">
                <h3 className="font-medium text-dark dark:text-white mb-2">
                  Real-time Monitoring
                </h3>
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  Desktop app for continuous behavioral monitoring
                </p>
              </div>
              <div className="border border-stroke dark:border-dark-3 rounded-lg p-4">
                <h3 className="font-medium text-dark dark:text-white mb-2">
                  Mobile App
                </h3>
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  Mobile monitoring with camera and sensor integration
                </p>
              </div>
              <div className="border border-stroke dark:border-dark-3 rounded-lg p-4">
                <h3 className="font-medium text-dark dark:text-white mb-2">
                  AI Analysis
                </h3>
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  Advanced pattern recognition and early warning system
                </p>
              </div>
              <div className="border border-stroke dark:border-dark-3 rounded-lg p-4">
                <h3 className="font-medium text-dark dark:text-white mb-2">
                  Health Reports
                </h3>
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  Detailed analytics and personalized recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 