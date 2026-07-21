import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "../actions";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; error?: string }>;
}) {
  const { jobId, error } = await searchParams;
  if (!jobId) notFound();

  const supabase = await createClient();

  const [{ data: job }, { count }] = await Promise.all([
    supabase.from("jobs").select("id, job_number, customers(name)").eq("id", jobId).single(),
    supabase.from("invoices").select("*", { count: "exact", head: true }),
  ]);

  if (!job) notFound();

  const customerName = (job.customers as unknown as { name: string } | null)?.name;
  const suggestedInvoiceNumber = `INV-${String((count ?? 0) + 1).padStart(4, "0")}`;
  const boundCreate = createInvoice.bind(null, jobId);

  return (
    <div className="max-w-lg">
      <p className="mb-1 text-sm text-slate-500">
        Customer: {customerName} · Job: {job.job_number}
      </p>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New invoice</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={boundCreate} className="space-y-4">
        <div>
          <label
            htmlFor="invoice_number"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Invoice number
          </label>
          <input
            id="invoice_number"
            name="invoice_number"
            required
            defaultValue={suggestedInvoiceNumber}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create invoice
        </button>
      </form>

      <p className="mt-3 text-sm text-slate-500">
        If this job came from an accepted quote, its line items will be copied in
        automatically. Otherwise you&apos;ll add items on the next screen.
      </p>
    </div>
  );
}
