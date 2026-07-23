"use client";

import { useMemo, useState } from "react";

import { ListPagination } from "@/component/ListPagination";
import { formatDisplayDate } from "@/lib/display-date";

type RsvpGuestResponse = {
  guestId: string;
  guestName: string;
  attendance: "confirmed" | "declined";
};

export type AdminRsvpEntry = {
  id: string;
  guestName: string;
  whatsapp: string;
  email: string | null;
  attendance: string;
  createdAt: string;
  guestResponses: RsvpGuestResponse[];
};

const RSVPS_PER_PAGE = 10;

function formatAttendance(value: string) {
  return value === "confirmed" ? "Confirmado" : "Recusado";
}

export function AdminRsvpList({ rsvps }: { rsvps: AdminRsvpEntry[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rsvps.length / RSVPS_PER_PAGE));
  const visibleRsvps = useMemo(() => {
    const start = (page - 1) * RSVPS_PER_PAGE;
    return rsvps.slice(start, start + RSVPS_PER_PAGE);
  }, [page, rsvps]);
  const startItem = rsvps.length === 0 ? 0 : (page - 1) * RSVPS_PER_PAGE + 1;
  const endItem = Math.min(page * RSVPS_PER_PAGE, rsvps.length);

  if (rsvps.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
        Nenhuma confirmacao registrada ainda.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {visibleRsvps.map((rsvp) => (
          <article
            key={rsvp.id}
            className="flex min-h-[10.5rem] flex-col rounded-[18px] border border-zinc-200 bg-[rgb(var(--paper))] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-zinc-900">
                  {rsvp.guestName}
                </h2>
                <p className="mt-1 text-xs text-zinc-600">
                  {formatAttendance(rsvp.attendance)} - {rsvp.guestResponses.length} nome
                  {rsvp.guestResponses.length === 1 ? "" : "s"} respondido
                  {rsvp.guestResponses.length === 1 ? "" : "s"}
                </p>
              </div>
              <p className="shrink-0 text-right text-[11px] leading-4 text-zinc-500">
                {formatDisplayDate(rsvp.createdAt)}
              </p>
            </div>

            <div className="mt-2 space-y-1 text-xs text-zinc-700">
              <p className="truncate">
                <span className="font-medium text-zinc-900">WhatsApp:</span>{" "}
                {rsvp.whatsapp}
              </p>
              <p className="truncate">
                <span className="font-medium text-zinc-900">Email:</span>{" "}
                {rsvp.email || "Nao informado"}
              </p>
            </div>

            <div className="mt-auto pt-3">
              <p className="mb-2 text-xs font-medium text-zinc-900">Nomes respondidos:</p>
              <ul className="flex min-h-8 flex-wrap gap-1.5">
                {rsvp.guestResponses.map((guestResponse) => (
                  <li
                    key={`${rsvp.id}-${guestResponse.guestId}`}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      guestResponse.attendance === "confirmed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {guestResponse.guestName}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <ListPagination
        page={page}
        totalPages={totalPages}
        totalItems={rsvps.length}
        startItem={startItem}
        endItem={endItem}
        itemLabel="confirmacoes"
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />
    </>
  );
}
