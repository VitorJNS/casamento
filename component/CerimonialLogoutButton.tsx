"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CerimonialLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/cerimonial/logout", { method: "POST" });
      router.push("/cerimonial");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Saindo..." : "Sair"}
    </button>
  );
}

