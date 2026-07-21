import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/component/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const [adminAuthenticated, cerimonialAuthenticated] = await Promise.all([
    isAdminAuthenticated(),
    isCerimonialAuthenticated(),
  ]);

  if (adminAuthenticated) {
    redirect("/admin/convidados");
  }

  if (cerimonialAuthenticated) {
    redirect("/cerimonial/dashboard");
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-4 sm:px-6 sm:py-8">
      <div className="w-full">
        <AdminLoginForm />
      </div>
    </main>
  );
}
