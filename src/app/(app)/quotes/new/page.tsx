import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createQuote } from "../actions";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; error?: string }>;
}) {
  const { customerId, error } = await searchParams;
  if (!customerId) notFound();

  const supabase = await createClient();
  const [{ data: customer }, { count }] = await Promise.all([
    supabase.from("customers").select("id, name").eq("id", customerId).single(),
    supabase.from("quotes").select("*", { count: "exact", head: true }),
  ]);

  if (!customer) notFound();

  const suggestedQuoteNumber = `QUOTE-${String((count ?? 0) + 1).padStart(4, "0")}`;
  const boundCreate = createQuote.bind(null, customerId);

  return (
    <div className="max-w-lg">
      <p className="mb-1 text-sm text-slate-500">Customer: {customer.name}</p>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New quote</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={boundCreate} className="space-y-4">
        <div>
          <label htmlFor="quote_number" className="mb-1 block text-sm font-medium text-slate-700">
            Quote number
          </label>
          <input
            id="quote_number"
            name="quote_number"
            required
            defaultValue={suggestedQuoteNumber}
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
          Create quote
        </button>
      </form>

      <p className="mt-3 text-sm text-slate-500">
        You&apos;ll add line items on the next screen.
      </p>
    </div>
  );
}
