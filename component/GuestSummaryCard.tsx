"use client";

import { ArrowUpRight, MessageCircle, Pencil, Phone, Trash2, Users } from "lucide-react";
import { formatDisplayDateTime } from "@/lib/display-date";
import type { PresenceGuest } from "@/lib/presence-dashboard";

export function GuestSummaryCard({ guest, onEdit, onRemove, onDetails, removing, disableRemove }: {
  guest: PresenceGuest;
  onEdit: () => void;
  onRemove: () => void;
  onDetails: (mode: "message" | "group") => void;
  removing: boolean;
  disableRemove: boolean;
}) {
  const family = guest.familyLabel || (guest.householdMembers.length > 1 ? `${guest.householdMembers.length} pessoas no mesmo grupo` : "Sem grupo vinculado");
  return (
    <>
      <div className="grid h-[184px] shrink-0 content-between gap-3 p-4 @min-[440px]/card:h-[136px] @min-[440px]/card:grid-cols-[minmax(0,1fr)_auto] @min-[440px]/card:content-start">
        <div className="min-w-0">
          <h3 title={guest.guestName} className="truncate text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{guest.guestName}</h3>
          <p className="mt-3 flex min-w-0 items-center gap-2 text-sm text-zinc-700"><Phone aria-hidden="true" className="size-4 shrink-0 text-[rgb(var(--olive))]" /><span className="truncate">{guest.whatsapp}</span></p>
          <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-zinc-600"><Users aria-hidden="true" className="size-4 shrink-0 text-[rgb(var(--lavender))]" /><span title={family} className="truncate">{family}</span></p>
        </div>
        <div className="flex items-start gap-2">
          <button type="button" onClick={onEdit} className="flex min-h-11 items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-[rgb(var(--olive))] hover:bg-zinc-50"><Pencil aria-hidden="true" className="size-4" />Editar</button>
          <button type="button" onClick={onRemove} disabled={disableRemove} className="flex min-h-11 items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 aria-hidden="true" className="size-4" />{removing ? "Removendo..." : "Remover"}</button>
        </div>
      </div>
      <div className="grid h-[144px] shrink-0 grid-cols-2 @min-[300px]/card:h-[112px] @min-[300px]/card:grid-cols-[1.1fr_0.8fr_1.3fr] divide-x divide-zinc-200 border-y border-zinc-200 bg-white/70 text-xs text-zinc-700 @min-[360px]/card:text-sm">
        <div className="min-w-0 px-3 py-4">
          <span className="block font-semibold text-zinc-500">Status</span>
          <span className="mt-2 flex items-center gap-1.5 font-medium text-zinc-950"><span className={`size-2 shrink-0 rounded-full ${guest.status === "confirmed" ? "bg-emerald-600" : guest.status === "declined" ? "bg-rose-600" : "bg-amber-500"}`} />{guest.status === "confirmed" ? "Confirmado" : guest.status === "declined" ? "Recusado" : "Pendente"}</span>
        </div>
        <div className="min-w-0 px-3 py-4"><span className="block font-semibold text-zinc-500">Tipo</span><span className="mt-2 block font-medium text-zinc-950">{guest.isChild ? "Criança" : "Adulto"}</span></div>
        <div className="col-span-2 min-w-0 border-t border-zinc-200 px-3 py-2 @min-[300px]/card:col-span-1 @min-[300px]/card:border-t-0 @min-[300px]/card:py-4"><span className="block font-semibold text-zinc-500">Resposta</span><span className="mt-2 block font-medium text-zinc-950">{guest.respondedAt ? formatDisplayDateTime(guest.respondedAt) : "Ainda não respondeu"}</span></div>
      </div>
      <div className="h-[104px] shrink-0 px-4 py-3">
        <p className="text-sm font-semibold text-zinc-600">Mesmo grupo</p>
        {guest.householdMembers.length > 1 ? (
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <ul className="flex min-w-0 gap-2">
              {guest.householdMembers.slice(0, 2).map((name, index) => <li key={`${guest.id}-${index}`} title={name} className={`inline-flex h-9 min-w-0 max-w-32 items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-medium ${name === guest.guestName ? "border-[rgb(var(--olive))] bg-white text-[rgb(var(--olive))]" : "border-zinc-300 text-zinc-700"}`}><Users aria-hidden="true" className="size-3.5 shrink-0" /><span className="truncate">{name}</span></li>)}
            </ul>
            <button type="button" aria-haspopup="dialog" aria-label={`Ver grupo de ${guest.guestName}`} onClick={() => onDetails("group")} className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-semibold text-[rgb(var(--olive))] hover:bg-white">{guest.householdMembers.length > 2 ? `+${guest.householdMembers.length - 2}` : "Ver"}</button>
          </div>
        ) : <p className="mt-3 text-sm text-zinc-500">Sem grupo vinculado</p>}
      </div>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-t border-zinc-200 px-4 text-xs @min-[360px]/card:text-sm">
        <span className="flex min-w-0 items-center gap-2 text-zinc-500"><MessageCircle aria-hidden="true" className="size-5 shrink-0" /><span>{guest.responseNote ? "Mensagem recebida" : guest.note ? "Anotação interna" : "Sem observação"}</span></span>
        {guest.responseNote || guest.note ? <button type="button" aria-haspopup="dialog" onClick={() => onDetails("message")} className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg font-semibold text-[rgb(var(--olive))] underline underline-offset-4 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2">{guest.responseNote ? "Ler mensagem" : "Ler anotação"}<ArrowUpRight aria-hidden="true" className="size-4" /></button> : null}
      </div>
    </>
  );
}
