import { unstable_cache } from "next/cache";

import { shouldRunRuntimeDbSetup } from "@/lib/env";
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
  secondary_whatsapp: string | null;
  secondary_whatsapp_normalized: string | null;
  email: string | null;
  adult_names: unknown;
  child_count: number;
  companion_names: unknown;
  note: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "");
}

const globalForPresenceSetup = globalThis as typeof globalThis & {
  ensureRsvpTablePromise?: Promise<void>;
  ensureGuestListTablePromise?: Promise<void>;
  ensureGuestListTableShapePromise?: Promise<void>;
  ensurePresenceTablesPromise?: Promise<void>;
  guestListColumnAvailabilityPromise?: Promise<GuestListColumnAvailability>;
};

export const RSVP_TAG = "rsvp";
export const GUEST_LIST_TAG = "guest-list";

type GuestListColumnAvailability = {
  secondaryWhatsapp: boolean;
  secondaryWhatsappNormalized: boolean;
  email: boolean;
  adultNames: boolean;
  childCount: boolean;
  companionNames: boolean;
};

type ColumnRow = {
  column_name: string;
};

export async function ensureRsvpTable() {
  if (!shouldRunRuntimeDbSetup()) {
    return;
  }

  if (globalForPresenceSetup.ensureRsvpTablePromise) {
    return globalForPresenceSetup.ensureRsvpTablePromise;
  }

  globalForPresenceSetup.ensureRsvpTablePromise = (async () => {
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
  })();

  return globalForPresenceSetup.ensureRsvpTablePromise;
}

export async function ensureGuestListTable() {
  if (shouldRunRuntimeDbSetup()) {
    if (!globalForPresenceSetup.ensureGuestListTablePromise) {
      globalForPresenceSetup.ensureGuestListTablePromise = (async () => {
        const prisma = getPrisma();

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS guest_list_entries (
            id TEXT PRIMARY KEY,
            guest_name TEXT NOT NULL,
            whatsapp TEXT NOT NULL,
            whatsapp_normalized TEXT NOT NULL,
            secondary_whatsapp TEXT,
            secondary_whatsapp_normalized TEXT,
            email TEXT,
            adult_names JSONB NOT NULL DEFAULT '[]'::jsonb,
            child_count INTEGER NOT NULL DEFAULT 0,
            companion_names JSONB NOT NULL DEFAULT '[]'::jsonb,
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
      })();
    }

    await globalForPresenceSetup.ensureGuestListTablePromise;
  }

  if (!globalForPresenceSetup.ensureGuestListTableShapePromise) {
    globalForPresenceSetup.ensureGuestListTableShapePromise = (async () => {
      const prisma = getPrisma();

      await prisma.$executeRawUnsafe(`
        ALTER TABLE guest_list_entries
        ADD COLUMN IF NOT EXISTS secondary_whatsapp TEXT;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE guest_list_entries
        ADD COLUMN IF NOT EXISTS secondary_whatsapp_normalized TEXT;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE guest_list_entries
        ADD COLUMN IF NOT EXISTS email TEXT;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE guest_list_entries
        ADD COLUMN IF NOT EXISTS adult_names JSONB NOT NULL DEFAULT '[]'::jsonb;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE guest_list_entries
        ADD COLUMN IF NOT EXISTS child_count INTEGER NOT NULL DEFAULT 0;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE guest_list_entries
        ADD COLUMN IF NOT EXISTS companion_names JSONB NOT NULL DEFAULT '[]'::jsonb;
      `);

      await prisma.$executeRawUnsafe(`
        UPDATE guest_list_entries
        SET secondary_whatsapp_normalized = regexp_replace(COALESCE(secondary_whatsapp, ''), '\\D', '', 'g')
        WHERE secondary_whatsapp IS NOT NULL
          AND (
            secondary_whatsapp_normalized IS NULL
            OR secondary_whatsapp_normalized = ''
          );
      `);

      globalForPresenceSetup.guestListColumnAvailabilityPromise = undefined;
    })();
  }

  return globalForPresenceSetup.ensureGuestListTableShapePromise;
}

export async function getGuestListColumnAvailability() {
  if (globalForPresenceSetup.guestListColumnAvailabilityPromise) {
    return globalForPresenceSetup.guestListColumnAvailabilityPromise;
  }

  globalForPresenceSetup.guestListColumnAvailabilityPromise = (async () => {
    const prisma = getPrisma();
    const columns = await prisma.$queryRawUnsafe<ColumnRow[]>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'guest_list_entries'
    `);

    const columnNames = new Set(columns.map((column) => column.column_name));

    return {
      secondaryWhatsapp: columnNames.has("secondary_whatsapp"),
      secondaryWhatsappNormalized: columnNames.has("secondary_whatsapp_normalized"),
      email: columnNames.has("email"),
      adultNames: columnNames.has("adult_names"),
      childCount: columnNames.has("child_count"),
      companionNames: columnNames.has("companion_names"),
    } satisfies GuestListColumnAvailability;
  })();

  return globalForPresenceSetup.guestListColumnAvailabilityPromise;
}

export async function ensurePresenceTables() {
  if (globalForPresenceSetup.ensurePresenceTablesPromise) {
    return globalForPresenceSetup.ensurePresenceTablesPromise;
  }

  globalForPresenceSetup.ensurePresenceTablesPromise = Promise.all([
    ensureRsvpTable(),
    ensureGuestListTable(),
  ]).then(() => undefined);

  return globalForPresenceSetup.ensurePresenceTablesPromise;
}

export async function listGuestListEntries(options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false;

  return includeInactive ? listAllGuestListEntriesCached() : listActiveGuestListEntriesCached();
}

async function queryGuestListEntries(includeInactive: boolean) {
  await ensureGuestListTable();
  const prisma = getPrisma();
  const columns = await getGuestListColumnAvailability();

  return prisma.$queryRawUnsafe<GuestListEntryRow[]>(
    `
      SELECT
        id,
        guest_name,
        whatsapp,
        whatsapp_normalized,
        ${columns.secondaryWhatsapp ? "secondary_whatsapp" : "NULL AS secondary_whatsapp"},
        ${
          columns.secondaryWhatsappNormalized
            ? "secondary_whatsapp_normalized"
            : "NULL AS secondary_whatsapp_normalized"
        },
        ${columns.email ? "email" : "NULL AS email"},
        ${columns.adultNames ? "adult_names" : "'[]'::jsonb AS adult_names"},
        ${columns.childCount ? "child_count" : "0 AS child_count"},
        ${columns.companionNames ? "companion_names" : "'[]'::jsonb AS companion_names"},
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

const listActiveGuestListEntriesCached = unstable_cache(
  async () => queryGuestListEntries(false),
  ["guest-list-active"],
  { revalidate: 15, tags: [GUEST_LIST_TAG] },
);

const listAllGuestListEntriesCached = unstable_cache(
  async () => queryGuestListEntries(true),
  ["guest-list-all"],
  { revalidate: 15, tags: [GUEST_LIST_TAG] },
);

