"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "not_active") {
      setError("Your account is not active. Please wait for verification.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "not_active") {
          setError("Your account is not active. Please wait for verification.");
        } else {
          setError("Invalid email or password");
        }
      } else {
        // Fetch session and redirect based on role
        setIsLoading(true);
        const checkRoleAndRedirect = async () => {
          let tries = 0;
          let session = null;
          while (tries < 10 && !session) {
            session = await getSession();
            if (!session) await new Promise(res => setTimeout(res, 200));
            tries++;
          }
          const role = session?.user?.role || session?.user?.role || 'patient';
          if (role === 'doctor') {
            router.push("/dashboard/admin");
          } else if (role === 'admin-sup') {
            router.push("/dashboard/admin-sup");
          } else {
            router.push("/dashboard/patient");
          }
        };
        checkRoleAndRedirect();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-dark dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-dark-6 dark:text-dark-4">
              Sign in to your Brain Fog Monitor account
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-dark-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-body-sm font-medium text-dark dark:text-white">
                  Email Address
                  <span className="ml-1 select-none text-red">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-body-sm font-medium text-dark dark:text-white">
                  Password
                  <span className="ml-1 select-none text-red">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-lg px-6 py-3 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-opacity-90'
                }`}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="text-center">
                <p className="text-sm text-dark-6 dark:text-dark-4">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-stroke bg-white px-6 py-3 font-medium text-dark transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
            >
              ← Go back to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 