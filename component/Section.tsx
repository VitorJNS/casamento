type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

export function Section({ id, title, children }: SectionProps) {
  return (
    <section
      id={id}
      className="mb-10 rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-6 shadow-sm"
    >
      <h2 className="display-font text-2xl font-semibold" style={{ color: "rgb(var(--olive))" }}>
        {title}
      </h2>


      <div className="mt-3 text-zinc-700">{children}</div>
    </section>
  );
}
