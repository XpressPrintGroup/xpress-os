import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addInvoiceItem,
  deleteInvoiceItem,
  updateInvoiceStatus,
  updateInvoiceNotes,
} from "../actions";
import { INVOICE_STATUSES } from "../statuses";
import { AddItemForm } from "./add-item-form";
import { DeleteItemButton } from "./delete-item-button";
import { PrintButton } from "./print-button";

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: invoice }, { data: items }, { data: products }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, customers(id, name, address), jobs(id, job_number)")
      .eq("id", id)
      .single(),
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("products").select("id, name, default_unit_price").order("name"),
  ]);

  if (!invoice) notFound();

  const customer = invoice.customers as { id: string; name: string; address: string | null } | null;
  const job = invoice.jobs as { id: string; job_number: string } | null;

  const boundUpdateStatus = updateInvoiceStatus.bind(null, id);
  const boundAddItem = addInvoiceItem.bind(null, id);
  const boundUpdateNotes = updateInvoiceNotes.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{invoice.invoice_number}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {customer && (
              <>
                <Link
                  href={`/customers/${customer.id}`}
                  className="font-medium text-slate-900 print:no-underline"
                >
                  {customer.name}
                </Link>
                {customer.address && <span> · {customer.address}</span>}
              </>
            )}
            {job && (
              <>
                {" · Job "}
                <Link href={`/jobs/${job.id}`} className="font-medium text-slate-900">
                  {job.job_number}
                </Link>
              </>
            )}
          </p>
        </div>
        <PrintButton />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 print:hidden">
          {error}
        </div>
      )}

      <form action={boundUpdateStatus} className="mb-6 flex items-end gap-2 print:hidden">
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={invoice.status}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Update status
        </button>
      </form>

      <p className="mb-3 text-sm font-medium text-slate-500 print:hidden">
        Status: <span className="text-slate-900">{invoice.status}</span>
      </p>

      <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 font-medium">Unit price</th>
              <th className="px-4 py-2 font-medium">Line total</th>
              <th className="px-4 py-2 font-medium print:hidden"></th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-800">{item.description}</td>
                <td className="px-4 py-2 text-slate-600">{item.quantity}</td>
                <td className="px-4 py-2 text-slate-600">
                  £{Number(item.unit_price).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  £{(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                </td>
                <td className="px-4 py-2 print:hidden">
                  <DeleteItemButton action={deleteInvoiceItem.bind(null, item.id, id)} />
                </td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No line items yet.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 font-semibold">
              <td className="px-4 py-2" colSpan={3}>
                Total
              </td>
              <td className="px-4 py-2">£{Number(invoice.total).toFixed(2)}</td>
              <td className="print:hidden"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <AddItemForm action={boundAddItem} products={products ?? []} />

      <form action={boundUpdateNotes} className="space-y-2">
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={invoice.notes ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none print:border-none print:p-0"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 print:hidden"
        >
          Save notes
        </button>
      </form>
    </div>
  );
}
