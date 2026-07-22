import { AdminShell } from "@/component/AdminShell";

export function AdminPageLoading() {
  return (
    <AdminShell title="Area dos Noivos">
      <div className="animate-pulse">
        <div className="h-12 w-72 rounded-2xl bg-zinc-200/80" />
        <div className="mt-4 h-6 max-w-3xl rounded-full bg-zinc-200/70" />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="h-4 w-32 rounded-full bg-zinc-200/80" />
              <div className="mt-3 h-8 w-16 rounded-xl bg-zinc-200/80" />
              <div className="mt-2 h-4 w-40 rounded-full bg-zinc-200/70" />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="h-5 w-44 rounded-full bg-zinc-200/80" />
          <div className="mt-2 h-4 w-72 rounded-full bg-zinc-200/70" />
          <div className="mt-6 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-[18px] border border-zinc-200 bg-zinc-100/70"
              />
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
