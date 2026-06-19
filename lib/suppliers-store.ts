import { getPrisma } from "@/lib/prisma";

export type SupplierEntryRow = {
  id: string;
  supplier_name: string;
  category: string;
  supplier_status: string;
  contact_name: string | null;
  phone: string;
  email: string | null;
  contract_value_cents: number | null;
  amount_paid_cents: number;
  next_payment_due: Date | null;
  note: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export async function ensureSuppliersTable() {
  const prisma = getPrisma();

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cerimonial_suppliers (
      id TEXT PRIMARY KEY,
      supplier_name TEXT NOT NULL,
      category TEXT NOT NULL,
      supplier_status TEXT NOT NULL DEFAULT 'pendente',
      contact_name TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      contract_value_cents INTEGER,
      amount_paid_cents INTEGER NOT NULL DEFAULT 0,
      next_payment_due DATE,
      note TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE cerimonial_suppliers
    ADD COLUMN IF NOT EXISTS supplier_status TEXT NOT NULL DEFAULT 'pendente';
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE cerimonial_suppliers
    ADD COLUMN IF NOT EXISTS contract_value_cents INTEGER;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE cerimonial_suppliers
    ADD COLUMN IF NOT EXISTS amount_paid_cents INTEGER NOT NULL DEFAULT 0;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE cerimonial_suppliers
    ADD COLUMN IF NOT EXISTS next_payment_due DATE;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_cerimonial_suppliers_category
    ON cerimonial_suppliers (category);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_cerimonial_suppliers_is_active
    ON cerimonial_suppliers (is_active);
  `);
}

export async function listSuppliers(options?: { includeInactive?: boolean }) {
  await ensureSuppliersTable();
  const prisma = getPrisma();
  const includeInactive = options?.includeInactive ?? false;

  return prisma.$queryRawUnsafe<SupplierEntryRow[]>(
    `
      SELECT
        id,
        supplier_name,
        category,
        supplier_status,
        contact_name,
        phone,
        email,
        contract_value_cents,
        amount_paid_cents,
        next_payment_due,
        note,
        is_active,
        created_at,
        updated_at
      FROM cerimonial_suppliers
      ${includeInactive ? "" : "WHERE is_active = TRUE"}
      ORDER BY supplier_name ASC
    `,
  );
}
