import { redirect } from "next/navigation";

import { CerimonialLoginForm } from "@/component/CerimonialLoginForm";
import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";

export const dynamic = "force-dynamic";

export default async function CerimonialLoginPage() {
  const authenticated = await isCerimonialAuthenticated();

  if (authenticated) {
    redirect("/cerimonial/dashboard");
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-4 sm:px-6 sm:py-8">
      <div className="w-full">
        <CerimonialLoginForm />
      </div>
    </main>
  );
}

