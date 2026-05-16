import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/component/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const authenticated = await isAdminAuthenticated();

  if (authenticated) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-10">
      <div className="flex min-h-[70vh] items-center justify-center">
        <AdminLoginForm />
      </div>
    </main>
  );
}
