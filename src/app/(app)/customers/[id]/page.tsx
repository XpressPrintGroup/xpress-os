import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer, deleteCustomer, addActivity } from "../actions";
import { DeleteButton } from "./delete-button";

function formatDateRange(start: string | null, end: string | null) {
  if (start && end) return `${start} – ${end}`;
  if (start) return `From ${start}`;
  if (end) return `Until ${end}`;
  return null;
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: customer }, { data: activity }, { data: jobs }, { data: quotes }, { data: campaigns }] =
    await Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase
        .from("customer_activity")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("id, job_number, status, due_date")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("quotes")
        .select("id, quote_number, status, total")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select("id, name, start_date, end_date")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!customer) notFound();

  const boundUpdate = updateCustomer.bind(null, id);
  const boundDelete = deleteCustomer.bind(null, id);
  const boundAddActivity = addActivity.bind(null, id);

  return (
    <div className="grid max-w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">{customer.name}</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={boundUpdate} className="space-y-4">
          <Field label="Name" name="name" defaultValue={customer.name} required />
          <Field label="Company" name="company" defaultValue={customer.company} />
          <Field label="Phone" name="phone" defaultValue={customer.phone} />
          <Field label="Email" name="email" type="email" defaultValue={customer.email} />
          <Field label="Address" name="address" defaultValue={customer.address} />
          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={customer.notes ?? ""}
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
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Customer notes</h2>

        <form action={boundAddActivity} className="mb-6 flex gap-2">
          <input
            name="text"
            placeholder="Log a general note about this customer..."
            required
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {activity?.map((entry) => (
            <li key={entry.id} className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-sm text-slate-800">{entry.text}</p>
              <p className="mt-1 text-xs text-slate-400">
                {entry.logged_by ?? "Unknown"} ·{" "}
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {activity?.length === 0 && (
            <p className="text-sm text-slate-400">No activity logged yet.</p>
          )}
        </ul>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Jobs</h2>
          <Link
            href={`/jobs/new?customerId=${id}`}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            New job
          </Link>
        </div>

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
            <p className="text-sm text-slate-400">No jobs yet.</p>
          )}
        </ul>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Quotes</h2>
          <Link
            href={`/quotes/new?customerId=${id}`}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            New quote
          </Link>
        </div>

        <ul className="space-y-3">
          {quotes?.map((quote) => (
            <li key={quote.id} className="rounded-md border border-slate-200 bg-white p-3">
              <Link href={`/quotes/${quote.id}`} className="font-medium text-slate-900">
                {quote.quote_number}
              </Link>
              <p className="mt-1 text-xs text-slate-400">
                {quote.status} · £{Number(quote.total).toFixed(2)}
              </p>
            </li>
          ))}
          {quotes?.length === 0 && (
            <p className="text-sm text-slate-400">No quotes yet.</p>
          )}
        </ul>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Campaigns</h2>
          <Link
            href={`/campaigns/new?customerId=${id}`}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            New campaign
          </Link>
        </div>

        <ul className="space-y-3">
          {campaigns?.map((campaign) => (
            <li key={campaign.id} className="rounded-md border border-slate-200 bg-white p-3">
              <Link href={`/campaigns/${campaign.id}`} className="font-medium text-slate-900">
                {campaign.name}
              </Link>
              {formatDateRange(campaign.start_date, campaign.end_date) && (
                <p className="mt-1 text-xs text-slate-400">
                  {formatDateRange(campaign.start_date, campaign.end_date)}
                </p>
              )}
            </li>
          ))}
          {campaigns?.length === 0 && (
            <p className="text-sm text-slate-400">No campaigns yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}
