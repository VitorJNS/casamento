"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { CerimonialLogoutButton } from "@/component/CerimonialLogoutButton";
import { LoggedAreaBackdrop } from "@/component/LoggedAreaBackdrop";

type CerimonialShellProps = {
  children: ReactNode;
  title?: string;
  topRight?: ReactNode;
};

type NavItem = {
  label: string;
  href?: string;
  icon: ({ className }: { className?: string }) => ReactNode;
};

const navItems: NavItem[] = [
  { label: "Lista de Convidados", href: "/cerimonial/dashboard", icon: UsersIcon },
  { label: "Fornecedores", href: "/cerimonial/fornecedores", icon: HandshakeIcon },
  // { label: "Mesas e Setores", icon: ChairIcon },
  // { label: "Relatorios", icon: ChartIcon },
];

export function CerimonialShell({
  children,
  title = "Area da Cerimonialista",
  topRight,
}: CerimonialShellProps) {
  const pathname = usePathname();

  return (
    <main className="logged-area-shell relative isolate min-h-dvh bg-[#fffdf3] text-zinc-950">
      <LoggedAreaBackdrop />

      <div className="relative z-10 xl:grid xl:min-h-dvh xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
        <aside className="border-b border-[#d8ddcf]/90 bg-[#fffefa]/88 px-5 py-5 backdrop-blur xl:sticky xl:top-0 xl:flex xl:h-dvh xl:flex-col xl:overflow-hidden xl:border-b-0 xl:border-r xl:px-6 xl:py-6">
          <div className="flex shrink-0 justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#d8ddcf]/80 bg-white/45 shadow-sm xl:h-28 xl:w-28">
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
              const isActive = item.href ? pathname === item.href : false;
              const content = (
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="whitespace-nowrap font-medium tracking-[0.06em]">
                    {item.label}
                  </span>
                </>
              );

              const className = `flex shrink-0 items-center gap-3 rounded-[18px] px-4 py-3.5 text-sm transition xl:w-full ${
                isActive
                  ? "bg-[#4f6146] text-[#fffdf3] shadow-sm"
                  : item.href
                    ? "text-[#66745c] hover:bg-white/75 hover:text-[#4f6146]"
                    : "cursor-default text-zinc-400"
              }`;

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={item.label} className={className} aria-disabled="true">
                  {content}
                </div>
              );
            })}
          </nav>

          <div className="mt-auto shrink-0 space-y-3 border-t border-[#d8ddcf]/80 pt-4">
            <CerimonialLogoutButton className="flex w-full items-center gap-3 rounded-[18px] border border-[#d8ddcf]/90 bg-white/55 px-5 py-3.5 text-left text-base font-medium text-[#66745c] shadow-sm transition hover:bg-white hover:text-[#4f6146] disabled:cursor-not-allowed disabled:opacity-60">
              <LogoutIcon className="h-5 w-5" />
              <span>Sair</span>
            </CerimonialLogoutButton>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[#d8ddcf]/90 bg-[#fffefa]/72 px-5 py-5 backdrop-blur xl:px-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="display-font text-[2.35rem] font-semibold leading-tight text-[#4f6146]">
                  {title}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b89543]">
                  Yasmim & Vitor
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

function ChairIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
      <path d="M4 13h16v4H4z" />
      <path d="M6 17v3" />
      <path d="M18 17v3" />
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

function ChartIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M4 19V5" />
      <path d="M20 19H4" />
      <path d="M8 17v-6" />
      <path d="M12 17V9" />
      <path d="M16 17V7" />
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
