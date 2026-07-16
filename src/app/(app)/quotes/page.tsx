import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QUOTE_STATUSES } from "./statuses";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("quotes")
    .select("id, quote_number, status, total, created_at, customers(name)")
    .order("created_at", { ascending: false });

  if (status?.trim()) {
    query = query.eq("status", status);
  }

  const { data: quotes, error } = await query;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Quotes</h1>
      </div>

      <form className="mb-4 flex gap-2">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Filter
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Quote #</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {quotes?.map((quote) => (
              <tr key={quote.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-0">
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="block px-4 py-2 font-medium text-slate-900"
                  >
                    {quote.quote_number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {(quote.customers as unknown as { name: string } | null)?.name}
                </td>
                <td className="px-4 py-2 text-slate-600">{quote.status}</td>
                <td className="px-4 py-2 text-slate-600">£{Number(quote.total).toFixed(2)}</td>
                <td className="px-4 py-2 text-slate-600">
                  {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : ""}
                </td>
              </tr>
            ))}
            {quotes?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No quotes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
