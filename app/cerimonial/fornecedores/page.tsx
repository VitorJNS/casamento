import {
  CerimonialSuppliersBoard,
  type CerimonialSupplierView,
} from "@/component/CerimonialSuppliersBoard";
import { requireCerimonialAuth } from "@/lib/cerimonial-auth";
import { toIsoString } from "@/lib/date";
import { listSuppliers } from "@/lib/suppliers-store";

export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";

function mapSupplier(
  supplier: Awaited<ReturnType<typeof listSuppliers>>[number],
): CerimonialSupplierView {
  return {
    id: supplier.id,
    supplierName: supplier.supplier_name,
    category: supplier.category,
    supplierStatus: supplier.supplier_status as CerimonialSupplierView["supplierStatus"],
    contactName: supplier.contact_name,
    phone: supplier.phone,
    email: supplier.email,
    note: supplier.note,
    updatedAt: toIsoString(supplier.updated_at),
  };
}

export default async function CerimonialSuppliersPage() {
  await requireCerimonialAuth();
  const suppliers = await listSuppliers();

  return (
    <CerimonialSuppliersBoard
      initialSuppliers={suppliers.map(mapSupplier)}
    />
  );
}
