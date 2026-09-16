"use client";

import { Search } from "lucide-react";
import { normalizeSupplierSearch } from "@/lib/supplier-filters";

export function SupplierFilters({ search, category, categories, resultCount, onSearchChange, onCategoryChange, onClear }: {
  search: string;
  category: string;
  categories: { value: string; label: string }[];
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClear: () => void;
}) {
  const active = normalizeSupplierSearch(search).length >= 3 || Boolean(category);
  return (
    <div className="mt-5 rounded-2xl border border-zinc-200 bg-[rgb(var(--paper))] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="supplier-search" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Pesquisar fornecedor</label>
          <div className="relative mt-3">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input id="supplier-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Digite pelo menos 3 caracteres" aria-describedby="supplier-search-help" className="h-12 w-full rounded-full border border-zinc-300 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]" />
          </div>
        </div>
        <div className="min-w-0 sm:w-56">
          <label htmlFor="supplier-category" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Categoria</label>
          <select id="supplier-category" value={category} onChange={(event) => onCategoryChange(event.target.value)} className="mt-3 h-12 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-900 focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]">
            <option value="">Todas as categorias</option>
            {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        {search || category ? <button type="button" onClick={onClear} className="rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Limpar filtros</button> : null}
      </div>
      <p id="supplier-search-help" className="mt-2 text-sm text-zinc-500">Busque por nome, contato, telefone, e-mail ou observação. A busca começa a partir de 3 caracteres.</p>
      {active ? <p role="status" className="mt-2 text-sm text-zinc-600">{resultCount} resultado{resultCount === 1 ? "" : "s"} encontrado{resultCount === 1 ? "" : "s"}.</p> : null}
    </div>
  );
}
