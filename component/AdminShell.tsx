"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminLogoutButton } from "@/component/AdminLogoutButton";

type AdminShellProps = {
  children: ReactNode;
  title?: string;
  topRight?: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: ({ className }: { className?: string }) => ReactNode;
};

const navItems: NavItem[] = [
  { label: "Lista de Convidados", href: "/admin/convidados", icon: UsersIcon },
  { label: "Fornecedores", href: "/admin/fornecedores", icon: HandshakeIcon },
  { label: "Presentes", href: "/admin/presentes", icon: GiftIcon },
];

export function AdminShell({
  children,
  title = "Area dos Noivos",
  topRight,
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <main className="relative z-10 min-h-dvh bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.82))] text-zinc-950">
      <div className="xl:grid xl:min-h-dvh xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
        <aside className="hidden border-r border-zinc-200/80 bg-white/88 px-6 py-6 backdrop-blur xl:sticky xl:top-0 xl:flex xl:h-dvh xl:flex-col xl:overflow-hidden">
          <div className="flex shrink-0 justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full xl:h-28 xl:w-28">
              <Image
                src="/brand/monograma.png"
                alt="Monograma do casamento"
                width={100}
                height={100}
                className="h-36 w-36 object-contain xl:h-40 xl:w-40"
                priority
              />
            </div>
          </div>

          <nav className="mt-6 flex gap-3 overflow-x-auto pb-1 xl:mt-10 xl:block xl:min-h-0 xl:flex-1 xl:space-y-3 xl:overflow-visible">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-3 rounded-[18px] px-4 py-3.5 text-sm transition xl:w-full ${
                    isActive
                      ? "bg-[rgb(var(--olive)/0.24)] text-zinc-900"
                      : "text-zinc-700 hover:bg-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="whitespace-nowrap font-medium tracking-[0.06em]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 shrink-0 space-y-3 border-t border-zinc-200/70 pt-4 xl:mt-6">
            <AdminLogoutButton className="flex w-full items-center gap-3 rounded-[18px] border border-zinc-200/80 bg-white/60 px-5 py-3.5 text-left text-base font-medium text-zinc-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
              <LogoutIcon className="h-5 w-5" />
              <span>Sair</span>
            </AdminLogoutButton>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/88 px-5 py-3 backdrop-blur xl:static xl:bg-white/74 xl:px-10 xl:py-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center justify-between gap-3 xl:hidden">
                <div className="flex items-center gap-3 xl:block">
                  <Image
                    src="/brand/monograma.png"
                    alt="Monograma do casamento"
                    width={44}
                    height={44}
                    className="h-11 w-11 object-contain xl:hidden"
                    priority
                  />
                  <p className="text-lg font-semibold tracking-[-0.03em] text-[rgb(var(--lavender))] xl:text-[2rem]">
                    {title}
                  </p>
                </div>
                <AdminLogoutButton className="rounded-full border border-zinc-200/80 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 xl:hidden">
                  Sair
                </AdminLogoutButton>
              </div>

              <div className="hidden xl:block">
                <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[rgb(var(--lavender))]">
                  {title}
                </p>
              </div>

              {topRight ? (
                <div className="flex flex-wrap items-center gap-3">{topRight}</div>
              ) : null}
            </div>
          </header>

          <section className="px-5 pb-28 pt-8 xl:px-10 xl:py-10">{children}</section>
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-zinc-200/90 bg-white/94 p-2 shadow-[0_18px_50px_rgba(24,24,27,0.16)] backdrop-blur xl:hidden">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] px-2 text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-[rgb(var(--olive)/0.18)] text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="leading-none">{getMobileNavLabel(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function getMobileNavLabel(label: string) {
  if (label === "Lista de Convidados") return "Convidados";
  return label;
}

function SvgIcon({
  className,
  children,
  viewBox = "0 0 24 24",
}: {
  className?: string;
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgIcon>
  );
}

function HandshakeIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="m11 12 2 2a2 2 0 0 0 2.83 0l3.34-3.34a2 2 0 0 0 0-2.83l-2-2a2 2 0 0 0-2.83 0L12 8" />
      <path d="m13 12-2-2a2 2 0 0 0-2.83 0l-3.34 3.34a2 2 0 0 0 0 2.83l2 2a2 2 0 0 0 2.83 0L12 16" />
      <path d="m7 7 2 2" />
      <path d="m15 15 2 2" />
    </SvgIcon>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13" />
      <path d="M3 12h18" />
      <path d="M7.5 8a2.5 2.5 0 1 1 0-5c2 0 4.5 2.4 4.5 5" />
      <path d="M16.5 8a2.5 2.5 0 1 0 0-5C14.5 3 12 5.4 12 8" />
    </SvgIcon>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </SvgIcon>
  );
}
