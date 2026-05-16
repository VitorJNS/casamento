"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel entrar.");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel entrar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md rounded-[28px] border border-zinc-200 bg-white/92 p-6 shadow-sm backdrop-blur"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Area dos noivos
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Entrar</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Use a senha configurada para acessar as confirmacoes de presenca e o resumo dos presentes.
      </p>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">
          Senha
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
          placeholder="Digite sua senha"
        />
      </label>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Entrando..." : "Acessar painel"}
        </button>

        <a
          href="/"
          className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
        >
          Voltar para o site
        </a>
      </div>
    </form>
  );
}
