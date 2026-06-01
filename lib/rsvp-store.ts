import { getPrisma } from "@/lib/prisma";

export type RsvpConfirmationRow = {
  id: string;
  guest_name: string;
  whatsapp: string;
  whatsapp_normalized: string;
  email: string | null;
  attendance: string;
  guest_count: number;
  child_count: number;
  companion_names: unknown;
  note: string | null;
  created_at: Date;
  updated_at: Date;
};

export type GuestListEntryRow = {
  id: string;
  guest_name: string;
  whatsapp: string;
  whatsapp_normalized: string;
  note: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "");
}

export async function ensureRsvpTable() {
  const prisma = getPrisma();

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS rsvp_confirmations (
      id TEXT PRIMARY KEY,
      guest_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      whatsapp_normalized TEXT,
      email TEXT,
      attendance TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      child_count INTEGER NOT NULL DEFAULT 0,
      companion_names JSONB NOT NULL DEFAULT '[]'::jsonb,
      note TEXT,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE rsvp_confirmations
    ADD COLUMN IF NOT EXISTS companion_names JSONB NOT NULL DEFAULT '[]'::jsonb;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE rsvp_confirmations
    ADD COLUMN IF NOT EXISTS child_count INTEGER NOT NULL DEFAULT 0;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE rsvp_confirmations
    ADD COLUMN IF NOT EXISTS whatsapp_normalized TEXT;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE rsvp_confirmations
    SET whatsapp_normalized = regexp_replace(COALESCE(whatsapp, ''), '\\D', '', 'g')
    WHERE whatsapp_normalized IS NULL OR whatsapp_normalized = '';
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_rsvp_confirmations_whatsapp_normalized
    ON rsvp_confirmations (whatsapp_normalized);
  `);
}

export async function ensureGuestListTable() {
  const prisma = getPrisma();

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS guest_list_entries (
      id TEXT PRIMARY KEY,
      guest_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      whatsapp_normalized TEXT NOT NULL,
      note TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS guest_list_entries_whatsapp_normalized_key
    ON guest_list_entries (whatsapp_normalized);
  `);
}

export async function ensurePresenceTables() {
  await Promise.all([ensureRsvpTable(), ensureGuestListTable()]);
}

export async function listGuestListEntries(options?: { includeInactive?: boolean }) {
  await ensureGuestListTable();
  const prisma = getPrisma();
  const includeInactive = options?.includeInactive ?? false;

  return prisma.$queryRawUnsafe<GuestListEntryRow[]>(
    `
      SELECT
        id,
        guest_name,
        whatsapp,
        whatsapp_normalized,
        note,
        is_active,
        created_at,
        updated_at
      FROM guest_list_entries
      ${includeInactive ? "" : "WHERE is_active = TRUE"}
      ORDER BY guest_name ASC
    `,
  );
}

