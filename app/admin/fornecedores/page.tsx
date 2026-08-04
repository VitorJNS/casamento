import {
  AdminSuppliersManager,
  type AdminSupplier,
} from "@/component/AdminSuppliersManager";
import { AdminDataError } from "@/component/AdminDataError";
import { AdminShell } from "@/component/AdminShell";
import { requireAdminAuth } from "@/lib/admin-auth";
import { toIsoString, toIsoStringOrNull } from "@/lib/date";
import { listSuppliers } from "@/lib/suppliers-store";

export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";

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
    contractUrl: supplier.contract_url,
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
  const suppliers = await listSuppliers().catch((error) => {
    console.error("Nao foi possivel carregar fornecedores.", error);
    return null;
  });

  if (!suppliers) {
    return (
      <AdminShell title="Area dos Noivos">
        <AdminDataError description="Nao conseguimos conectar ao banco para carregar os fornecedores agora. Tente novamente em alguns segundos." />
      </AdminShell>
    );
  }

  return <AdminSuppliersManager initialSuppliers={suppliers.map(mapSupplier)} />;
}
