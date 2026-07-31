"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export function CerimonialLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/cerimonial/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel entrar.");
      }

      router.prefetch("/cerimonial/dashboard");
      startTransition(() => {
        router.replace("/cerimonial/dashboard");
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel entrar.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md rounded-[28px] border border-[#d8ddcf]/95 bg-[#fffefa]/92 p-5 shadow-[0_24px_70px_rgba(79,97,70,0.14)] backdrop-blur sm:p-6"
    >
      <div className="mb-5 flex justify-center">
        <div className="relative h-20 w-20 opacity-85">
          <Image
            src="/brand/monograma.png"
            alt="Monograma do casamento"
            fill
            sizes="80px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#b89543]">
        Area da cerimonialista
      </p>
      <h1 className="display-font mt-1.5 text-center text-4xl font-semibold text-[#4f6146] sm:mt-2">
        Entrar
      </h1>
      <p className="mt-2 text-center text-sm leading-5 text-[#66745c] sm:leading-6">
        Use a senha da cerimonialista para acompanhar apenas a confirmacao de presenca dos convidados.
      </p>

      <label className="mt-4 block sm:mt-5">
        <span className="mb-1.5 block text-sm font-medium text-[#4f6146]">
          Senha
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-[#d8ddcf] bg-white/95 px-4 py-3 text-sm outline-none transition focus:border-[#4f6146] focus:ring-2 focus:ring-[#b19cd9]/25"
          placeholder="Digite sua senha"
        />
      </label>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 sm:mt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#4f6146] px-5 py-3 text-sm font-semibold text-[#fffdf3] shadow-sm transition hover:bg-[#b89543] disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full"
        >
          {isSubmitting ? "Entrando..." : "Acessar painel"}
        </button>

        <a
          href="/preview-design"
          className="inline-flex rounded-full border border-[#d8ddcf] px-4 py-2 text-sm font-medium text-[#66745c] transition hover:bg-white hover:text-[#4f6146] max-sm:w-full max-sm:justify-center"
        >
          Voltar para o site
        </a>
      </div>
    </form>
  );
}

