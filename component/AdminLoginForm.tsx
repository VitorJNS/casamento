"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "cerimonial">("admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdminRole = role === "admin";
  const title = isAdminRole ? "Area dos noivos" : "Area da cerimonialista";
  const description = isAdminRole
    ? "Use a senha dos noivos para acessar confirmacoes de presenca, lista-base de convidados e resumo dos presentes."
    : "Use a senha da cerimonialista para acompanhar apenas a confirmacao de presenca dos convidados.";
  const submitLabel = isAdminRole ? "Acessar painel dos noivos" : "Acessar painel da cerimonialista";
  const endpoint = isAdminRole ? "/api/admin/login" : "/api/cerimonial/login";
  const fallbackDestination = isAdminRole
    ? "/admin/convidados"
    : "/cerimonial/dashboard";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel entrar.");
      }

      const destination = data?.destination ?? fallbackDestination;
      router.prefetch(destination);
      startTransition(() => {
        router.replace(destination);
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
      className="mx-auto w-full max-w-md rounded-[28px] border border-zinc-200 bg-white/92 p-5 shadow-sm backdrop-blur sm:p-6"
    >
      <div className="rounded-full border border-zinc-200 bg-[rgb(var(--paper))] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setPassword("");
              setErrorMessage(null);
            }}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isAdminRole
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Noivos
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("cerimonial");
              setPassword("");
              setErrorMessage(null);
            }}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              !isAdminRole
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Cerimonialista
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:mt-5">
        {title}
      </p>
      <h1 className="mt-1.5 text-2xl font-semibold text-zinc-900 sm:mt-2 sm:text-3xl">Entrar</h1>
      <p className="mt-2 text-sm leading-5 text-zinc-600 sm:leading-6">
        {description}
      </p>

      <label className="mt-4 block sm:mt-5">
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

      <div className="mt-4 flex flex-wrap gap-3 sm:mt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full"
        >
          {isSubmitting ? "Entrando..." : submitLabel}
        </button>

        <a
          href="/"
          className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 max-sm:w-full max-sm:justify-center"
        >
          Voltar para o site
        </a>
      </div>
    </form>
  );
}
