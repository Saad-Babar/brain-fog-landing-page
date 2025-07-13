import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "patient") {
    redirect("/login");
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>
      <p>Welcome! Here you can view your details and test results.</p>
    </div>
  );
} 