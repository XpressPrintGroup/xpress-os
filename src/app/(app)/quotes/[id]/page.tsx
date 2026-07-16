import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addQuoteItem,
  convertQuoteToJob,
  deleteQuoteItem,
  updateQuoteStatus,
} from "../actions";
import { QUOTE_STATUSES } from "../statuses";
import { DeleteItemButton } from "./delete-item-button";

export default async function QuoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: quote }, { data: items }] = await Promise.all([
    supabase.from("quotes").select("*, customers(id, name)").eq("id", id).single(),
    supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!quote) notFound();

  const customer = quote.customers as { id: string; name: string } | null;

  const boundUpdateStatus = updateQuoteStatus.bind(null, id);
  const boundAddItem = addQuoteItem.bind(null, id);
  const boundConvertToJob = convertQuoteToJob.bind(null, id, quote.customer_id);

  return (
    <div className="max-w-2xl">
      <p className="mb-1 text-sm text-slate-500">
        {customer && (
          <>
            Customer:{" "}
            <Link href={`/customers/${customer.id}`} className="font-medium text-slate-900">
              {customer.name}
            </Link>
          </>
        )}
      </p>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        {quote.quote_number} · £{Number(quote.total).toFixed(2)}
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-end gap-2">
        <form action={boundUpdateStatus} className="flex items-end gap-2">
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={quote.status}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              {QUOTE_STATUSES.map((s) => (
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

        {quote.status === "Accepted" && (
          <form action={boundConvertToJob}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Convert to job
            </button>
          </form>
        )}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-900">Line items</h2>

      <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 font-medium">Unit price</th>
              <th className="px-4 py-2 font-medium">Line total</th>
              <th className="px-4 py-2 font-medium"></th>
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
                <td className="px-4 py-2">
                  <DeleteItemButton action={deleteQuoteItem.bind(null, item.id, id)} />
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
        </table>
      </div>

      <form action={boundAddItem} className="flex items-end gap-2">
        <div className="flex-1">
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <input
            id="description"
            name="description"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="w-20">
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-700">
            Qty
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="any"
            min="0"
            defaultValue="1"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="w-28">
          <label
            htmlFor="unit_price"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Unit price
          </label>
          <input
            id="unit_price"
            name="unit_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue="0"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add item
        </button>
      </form>
    </div>
  );
}
