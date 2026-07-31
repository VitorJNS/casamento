import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/component/AdminLoginForm";
import { LoggedAreaBackdrop } from "@/component/LoggedAreaBackdrop";
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
    <main className="logged-area-shell relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#fffdf3] px-4 py-4 sm:px-6 sm:py-8">
      <LoggedAreaBackdrop variant="full" />
      <div className="relative z-10 w-full max-w-6xl">
        <AdminLoginForm />
      </div>
    </main>
  );
}
