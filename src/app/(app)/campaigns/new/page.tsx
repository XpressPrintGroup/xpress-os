import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCampaign } from "../actions";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; error?: string }>;
}) {
  const { customerId, error } = await searchParams;
  if (!customerId) notFound();

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name")
    .eq("id", customerId)
    .single();

  if (!customer) notFound();

  const boundCreate = createCampaign.bind(null, customerId);

  return (
    <div className="max-w-lg">
      <p className="mb-1 text-sm text-slate-500">Customer: {customer.name}</p>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New campaign</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={boundCreate} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Campaign name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="start_date" className="mb-1 block text-sm font-medium text-slate-700">
              Start date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="end_date" className="mb-1 block text-sm font-medium text-slate-700">
              End date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
            Notes
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
          Create campaign
        </button>
      </form>
    </div>
  );
}
