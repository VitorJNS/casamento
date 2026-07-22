import { CerimonialShell } from "@/component/CerimonialShell";

export function CerimonialPageLoading() {
  return (
    <CerimonialShell title="Area da Cerimonialista">
      <div className="animate-pulse">
        <div className="h-12 w-72 rounded-2xl bg-zinc-200/80" />
        <div className="mt-4 h-6 max-w-3xl rounded-full bg-zinc-200/70" />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
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

        <div className="mt-8 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-[18px] border border-zinc-200 bg-white/80"
            />
          ))}
        </div>
      </div>
    </CerimonialShell>
  );
}
