import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/component/AdminLoginForm";
import { LoggedAreaBackdrop } from "@/component/LoggedAreaBackdrop";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const adminAuthenticated = await isAdminAuthenticated();

  if (adminAuthenticated) {
    redirect("/admin/convidados");
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
