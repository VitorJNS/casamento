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
    <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.82))] text-zinc-950">
      <div className="xl:grid xl:min-h-screen xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
        <aside className="border-b border-zinc-200/80 bg-white/88 px-5 py-6 backdrop-blur xl:sticky xl:top-0 xl:h-screen xl:self-start xl:border-b-0 xl:border-r xl:px-6 xl:py-7">
          <div className="flex justify-center xl:justify-start">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[rgb(var(--paper))] shadow-[0_18px_50px_rgba(24,24,27,0.08)]">
              <Image
                src="/brand/monograma1.png"
                alt="Monograma do casamento"
                width={88}
                height={88}
                className="h-20 w-20 object-contain"
                priority
              />
            </div>
          </div>

          <nav className="mt-8 flex gap-3 overflow-x-auto pb-1 xl:mt-14 xl:block xl:space-y-3 xl:overflow-visible">
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

          <div className="mt-8 space-y-3 xl:mt-auto xl:flex xl:min-h-[62vh] xl:flex-col xl:justify-end">
            <AdminLogoutButton className="flex w-full items-center gap-3 rounded-[18px] border border-transparent px-5 py-4 text-left text-base font-medium text-zinc-700 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60">
              <LogoutIcon className="h-5 w-5" />
              <span>Sair</span>
            </AdminLogoutButton>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-zinc-200/80 bg-white/74 px-5 py-5 backdrop-blur xl:px-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[rgb(var(--lavender))]">
                  {title}
                </p>
              </div>

              {topRight ? (
                <div className="flex flex-wrap items-center gap-3">{topRight}</div>
              ) : null}
            </div>
          </header>

          <section className="px-5 py-8 xl:px-10 xl:py-10">{children}</section>
        </div>
      </div>
    </main>
  );
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
