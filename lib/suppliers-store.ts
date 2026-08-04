import { unstable_cache } from "next/cache";

import { shouldRunRuntimeDbSetup } from "@/lib/env";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";

export type SupplierEntryRow = {
  id: string;
  supplier_name: string;
  category: string;
  supplier_status: string;
  contact_name: string | null;
  phone: string;
  email: string | null;
  contract_value_cents: number | null;
  contract_url: string | null;
  amount_paid_cents: number;
  next_payment_due: Date | null;
  note: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

const globalForSupplierSetup = globalThis as typeof globalThis & {
  ensureSuppliersTablePromise?: Promise<void>;
  ensureSupplierContractUrlColumnPromise?: Promise<void>;
};

export const SUPPLIERS_TAG = "suppliers";

export function isMissingSupplierContractUrlColumn(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  return message.includes("contract_url") && (code === "42703" || message.includes("42703"));
}

export async function ensureSupplierContractUrlColumn() {
  if (globalForSupplierSetup.ensureSupplierContractUrlColumnPromise) {
    return globalForSupplierSetup.ensureSupplierContractUrlColumnPromise;
  }

  globalForSupplierSetup.ensureSupplierContractUrlColumnPromise = withPrismaRetry(async () => {
    const prisma = getPrisma();

    await prisma.$executeRawUnsafe(`
      ALTER TABLE cerimonial_suppliers
      ADD COLUMN IF NOT EXISTS contract_url TEXT;
    `);
  }).catch((error) => {
    globalForSupplierSetup.ensureSupplierContractUrlColumnPromise = undefined;
    throw error;
  });

  return globalForSupplierSetup.ensureSupplierContractUrlColumnPromise;
}

export async function ensureSuppliersTable() {
  if (!shouldRunRuntimeDbSetup()) {
    return ensureSupplierContractUrlColumn();
  }

  if (globalForSupplierSetup.ensureSuppliersTablePromise) {
    await globalForSupplierSetup.ensureSuppliersTablePromise;
    return ensureSupplierContractUrlColumn();
  }

  globalForSupplierSetup.ensureSuppliersTablePromise = withPrismaRetry(async () => {
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
        contract_url TEXT,
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
      ADD COLUMN IF NOT EXISTS contract_url TEXT;
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
  }).catch((error) => {
    globalForSupplierSetup.ensureSuppliersTablePromise = undefined;
    throw error;
  });

  return globalForSupplierSetup.ensureSuppliersTablePromise;
}

export async function listSuppliers(options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false;

  return includeInactive ? listAllSuppliersCached() : listActiveSuppliersCached();
}

async function selectSuppliers(includeInactive: boolean, includeContractUrl: boolean) {
  const prisma = getPrisma();

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
        ${includeContractUrl ? "contract_url" : "NULL AS contract_url"},
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

async function querySuppliers(includeInactive: boolean) {
  return withPrismaRetry(async () => {
    await ensureSuppliersTable();

    try {
      return await selectSuppliers(includeInactive, true);
    } catch (error) {
      if (!isMissingSupplierContractUrlColumn(error)) {
        throw error;
      }

      await ensureSupplierContractUrlColumn().catch(() => undefined);
      return selectSuppliers(includeInactive, false);
    }
  });
}

const listActiveSuppliersCached = unstable_cache(
  async () => querySuppliers(false),
  ["suppliers-active"],
  { revalidate: 15, tags: [SUPPLIERS_TAG] },
);

const listAllSuppliersCached = unstable_cache(
  async () => querySuppliers(true),
  ["suppliers-all"],
  { revalidate: 15, tags: [SUPPLIERS_TAG] },
);
