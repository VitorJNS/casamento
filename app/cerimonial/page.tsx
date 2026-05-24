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
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-10">
      <div className="flex min-h-[70vh] items-center justify-center">
        <CerimonialLoginForm />
      </div>
    </main>
  );
}

