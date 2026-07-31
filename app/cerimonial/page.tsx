import { redirect } from "next/navigation";

import { CerimonialLoginForm } from "@/component/CerimonialLoginForm";
import { LoggedAreaBackdrop } from "@/component/LoggedAreaBackdrop";
import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";

export const dynamic = "force-dynamic";

export default async function CerimonialLoginPage() {
  const authenticated = await isCerimonialAuthenticated();

  if (authenticated) {
    redirect("/cerimonial/dashboard");
  }

  return (
    <main className="logged-area-shell relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#fffdf3] px-4 py-4 sm:px-6 sm:py-8">
      <LoggedAreaBackdrop variant="full" />
      <div className="relative z-10 w-full max-w-6xl">
        <CerimonialLoginForm />
      </div>
    </main>
  );
}

