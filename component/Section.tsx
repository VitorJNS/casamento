type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  fullScreen?: boolean;
  titleClassName?: string;
};

export function Section({
  id,
  title,
  children,
  fullScreen = true,
  titleClassName = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`section-shell mb-10 rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6 ${
        fullScreen ? "section-fullscreen" : ""
      }`}
    >
      <h2
        className={`display-font text-2xl font-semibold ${titleClassName}`.trim()}
        style={{ color: "rgb(var(--olive))" }}
      >
        {title}
      </h2>

      <div className="mt-3 text-zinc-700">{children}</div>
    </section>
  );
}
