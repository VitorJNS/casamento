import {
  AdminSuppliersManager,
  type AdminSupplier,
} from "@/component/AdminSuppliersManager";
import { requireAdminAuth } from "@/lib/admin-auth";
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
    nextPaymentDue: supplier.next_payment_due?.toISOString() ?? null,
    note: supplier.note,
    isActive: supplier.is_active,
    createdAt: supplier.created_at.toISOString(),
    updatedAt: supplier.updated_at.toISOString(),
  };
}

export default async function AdminSuppliersPage() {
  await requireAdminAuth();
  const suppliers = await listSuppliers();

  return <AdminSuppliersManager initialSuppliers={suppliers.map(mapSupplier)} />;
}
