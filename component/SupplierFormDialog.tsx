"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { ChevronDown, FileText, MessageSquare, UserRound, X } from "lucide-react";

/** Native modal keeps focus and the rest of the page inert, including shell navigation. */
export function SupplierFormDialog({ title, children, onClose, onSubmit, busy, submitLabel, error }: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  submitLabel: string;
  error: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const viewport = window.visualViewport;
    const updateViewport = () => {
      dialog.style.setProperty("--supplier-height", `${viewport?.height ?? window.innerHeight}px`);
      dialog.style.setProperty("--supplier-top", `${viewport?.offsetTop ?? 0}px`);
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && dialog.contains(focused) && focused.matches("input, textarea")) {
        focused.scrollIntoView({ block: "nearest" });
      }
    };
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} className="supplier-dialog" onCancel={(event) => {
      event.preventDefault();
      if (!busy) onClose();
    }}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3">
        <h2 id={titleId} className="text-xl font-semibold tracking-tight text-zinc-950">{title}</h2>
        <button type="button" aria-label="Fechar" autoFocus disabled={busy} onClick={onClose} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-zinc-50 text-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"><X size={22} aria-hidden="true" /></button>
      </header>
      <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <fieldset disabled={busy} className="supplier-form-body min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <p className="mb-5 text-sm text-zinc-600">Comece pelo essencial. Complete depois.</p>
          {children}
        </fieldset>
        <footer className="supplier-form-footer shrink-0 border-t border-zinc-200 bg-white px-5 pt-3">
          {error ? <p role="alert" className="mb-3 max-h-24 overflow-y-auto whitespace-pre-line rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full bg-[rgb(var(--olive))] px-5 py-3 text-base font-semibold text-white hover:opacity-90 disabled:opacity-60">{submitLabel}</button>
        </footer>
      </form>
    </dialog>
  );
}

export function SupplierFormSection({ title, children }: { title: string; children: ReactNode }) {
  const Icon = title === "Contato adicional" ? UserRound : title === "Contrato e pagamentos" ? FileText : MessageSquare;
  return (
    <details className="supplier-form-section border-b border-zinc-200 py-1">
      <summary className="flex cursor-pointer items-center gap-3 rounded-lg py-4 text-base font-semibold text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--lavender)/0.16)] text-[rgb(var(--olive))]"><Icon size={21} aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">{title}<span className="mt-1 block text-xs font-normal text-[rgb(var(--olive))]">Opcional</span></span>
        <ChevronDown className="supplier-section-chevron shrink-0" size={20} aria-hidden="true" />
      </summary>
      <div className="grid min-w-0 gap-4 pb-5 pt-1">{children}</div>
    </details>
  );
}
