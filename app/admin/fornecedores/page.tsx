import {
  AdminSuppliersManager,
  type AdminSupplier,
} from "@/component/AdminSuppliersManager";
import { requireAdminAuth } from "@/lib/admin-auth";
import { toIsoString, toIsoStringOrNull } from "@/lib/date";
import { listSuppliers } from "@/lib/suppliers-store";

export const dynamic = "force-dynamic";

function mapSupplier(
  supplier: Awaited<ReturnType<typeof listSuppliers>>[number],
): AdminSupplier {
  return {
    id: supplier.id,
    supplierName: supplier.supplier_name,
    category: supplier.category,
    supplierStatus: supplier.supplier_status as AdminSupplier["supplierStatus"],
    contactName: supplier.contact_name,
    phone: supplier.phone,
    email: supplier.email,
    contractValueCents: supplier.contract_value_cents,
    amountPaidCents: supplier.amount_paid_cents,
    nextPaymentDue: toIsoStringOrNull(supplier.next_payment_due),
    note: supplier.note,
    isActive: supplier.is_active,
    createdAt: toIsoString(supplier.created_at),
    updatedAt: toIsoString(supplier.updated_at),
  };
}

export default async function AdminSuppliersPage() {
  await requireAdminAuth();
  const suppliers = await listSuppliers();

  return <AdminSuppliersManager initialSuppliers={suppliers.map(mapSupplier)} />;
}
