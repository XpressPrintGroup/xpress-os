import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { INVOICE_STATUSES } from "./statuses";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select("id, invoice_number, status, total, created_at, customers(name), jobs(job_number)")
    .order("created_at", { ascending: false });

  if (status?.trim()) {
    query = query.eq("status", status);
  }

  const { data: invoices, error } = await query;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Invoices</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/invoices"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        {INVOICE_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/invoices?status=${encodeURIComponent(s)}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              status === s
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Invoice #</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Job</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((invoice) => (
              <tr key={invoice.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block px-4 py-2 font-medium text-slate-900"
                  >
                    {invoice.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {(invoice.customers as unknown as { name: string } | null)?.name}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {(invoice.jobs as unknown as { job_number: string } | null)?.job_number}
                </td>
                <td className="px-4 py-2 text-slate-600">{invoice.status}</td>
                <td className="px-4 py-2 text-slate-600">
                  £{Number(invoice.total).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : ""}
                </td>
              </tr>
            ))}
            {invoices?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
