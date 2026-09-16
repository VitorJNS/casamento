type SearchableSupplier = {
  supplierName: string;
  category: string;
  contactName: string | null;
  phone: string;
  email: string | null;
  note: string | null;
};

export function normalizeSupplierSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function getSupplierCategories(suppliers: SearchableSupplier[]) {
  const categories = new Map<string, string>();
  for (const supplier of suppliers) {
    const label = supplier.category.trim();
    const key = normalizeSupplierSearch(label);
    if (key && !categories.has(key)) categories.set(key, label);
  }
  return Array.from(categories, ([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function filterSuppliers<T extends SearchableSupplier>(suppliers: T[], search: string, category: string) {
  const query = normalizeSupplierSearch(search);
  return suppliers.filter((supplier) => {
    if (category && normalizeSupplierSearch(supplier.category) !== category) return false;
    return query.length < 3 || normalizeSupplierSearch([
      supplier.supplierName, supplier.category, supplier.contactName,
      supplier.phone, supplier.email, supplier.note,
    ].filter(Boolean).join(" ")).includes(query);
  });
}
