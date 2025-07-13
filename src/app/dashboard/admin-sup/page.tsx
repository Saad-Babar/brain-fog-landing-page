import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminSupDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin-sup") {
    redirect("/login");
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
      <p>Welcome! Here you can manage doctors, system settings, and more.</p>
    </div>
  );
} 