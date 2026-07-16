import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCampaign, deleteCampaign } from "../actions";
import { DeleteButton } from "./delete-button";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, customers(id, name)")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const customer = campaign.customers as { id: string; name: string } | null;

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, job_number, status, due_date")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  const boundUpdate = updateCampaign.bind(null, id, campaign.customer_id);
  const boundDelete = deleteCampaign.bind(null, id, campaign.customer_id);

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
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
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">{campaign.name}</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={boundUpdate} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Campaign name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={campaign.name}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="start_date"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Start date
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={campaign.start_date ?? ""}
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
                defaultValue={campaign.end_date ?? ""}
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
              defaultValue={campaign.notes ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Save changes
          </button>
        </form>

        <div className="mt-3">
          <DeleteButton action={boundDelete} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Jobs in this campaign ({jobs?.length ?? 0})
        </h2>

        <ul className="space-y-3">
          {jobs?.map((job) => (
            <li key={job.id} className="rounded-md border border-slate-200 bg-white p-3">
              <Link href={`/jobs/${job.id}`} className="font-medium text-slate-900">
                {job.job_number}
              </Link>
              <p className="mt-1 text-xs text-slate-400">
                {job.status}
                {job.due_date ? ` · Due ${job.due_date}` : ""}
              </p>
            </li>
          ))}
          {jobs?.length === 0 && (
            <p className="text-sm text-slate-400">No jobs assigned to this campaign yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
