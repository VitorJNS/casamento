"use client";

import { useEffect, useId, useRef } from "react";
import { MessageCircle, Users, X } from "lucide-react";
import { formatDisplayDateTime } from "@/lib/display-date";
import type { PresenceGuest } from "@/lib/presence-dashboard";

export function GuestDetailsDialog({ guest, mode, onClose }: {
  guest: PresenceGuest;
  mode: "message" | "group";
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isMessage = mode === "message";
  const Icon = isMessage ? MessageCircle : Users;

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
      className={`fixed inset-x-0 bottom-auto top-1/2 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] -translate-y-1/2 flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-0 text-zinc-950 shadow-2xl backdrop:bg-black/50 open:flex sm:max-h-[calc(100dvh-4rem)] ${isMessage ? "h-[calc(100dvh-2rem)] max-w-[640px] sm:h-auto" : "h-auto max-w-[480px]"}`}
    >
      <header className="shrink-0 px-5 pb-5 pt-5 sm:px-8 sm:pt-7">
        <div className="flex items-start gap-3">
          <Icon aria-hidden="true" className="mt-2 size-7 shrink-0 text-[rgb(var(--lavender))]" />
          <h2 id={titleId} className="min-w-0 flex-1 pt-1 text-2xl font-semibold tracking-tight [overflow-wrap:anywhere]">
            {isMessage ? "Mensagem de" : "Grupo de"} {guest.guestName}
          </h2>
          <button type="button" autoFocus aria-label="Fechar janela" onClick={onClose} className="flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--olive))]">
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <span className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${guest.status === "confirmed" ? "bg-emerald-600" : guest.status === "declined" ? "bg-rose-600" : "bg-amber-500"}`} />
            {guest.status === "confirmed" ? "Confirmado" : guest.status === "declined" ? "Recusado" : "Pendente"}
          </span>
          {guest.respondedAt ? <span>{formatDisplayDateTime(guest.respondedAt)}</span> : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-y border-zinc-200 px-5 py-6 sm:px-8" tabIndex={0} aria-label={isMessage ? "Conteúdo da mensagem" : "Pessoas do grupo"}>
        {isMessage ? (
          <div className="space-y-6">
            {guest.responseNote ? (
              <section>
                <h3 className="text-sm font-medium text-zinc-500">Observação da confirmação</h3>
                <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed [overflow-wrap:anywhere] sm:text-lg">{guest.responseNote}</p>
              </section>
            ) : null}
            {guest.note ? (
              <section className={guest.responseNote ? "border-t border-zinc-200 pt-5" : ""}>
                <h3 className="text-sm font-medium text-zinc-500">Anotação interna</h3>
                <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed [overflow-wrap:anywhere] sm:text-lg">{guest.note}</p>
              </section>
            ) : null}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-zinc-500 [overflow-wrap:anywhere]">{guest.familyLabel || "Pessoas do mesmo grupo"}</p>
            <ul className="space-y-3">
              {guest.householdMembers.map((name, index) => <li key={`${name}-${index}`} className="flex items-start gap-3 [overflow-wrap:anywhere]"><Users aria-hidden="true" className="mt-1 size-4 shrink-0 text-[rgb(var(--olive))]" /><span className="min-w-0">{name}</span></li>)}
            </ul>
          </div>
        )}
      </div>

      <footer className="shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pt-5">
        <button type="button" onClick={onClose} className="min-h-12 w-full rounded-xl bg-[rgb(var(--olive))] px-6 py-3 text-base font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--olive))] sm:ml-auto sm:block sm:w-auto">
          Fechar
        </button>
      </footer>
    </dialog>
  );
}
