import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateJob, updateJobStatus } from "../actions";
import { JOB_STATUSES } from "../statuses";

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, customers(id, name)")
    .eq("id", id)
    .single();

  if (!job) notFound();

  const customer = job.customers as { id: string; name: string } | null;

  const boundUpdate = updateJob.bind(null, id, job.customer_id);
  const boundUpdateStatus = updateJobStatus.bind(null, id);

  return (
    <div className="max-w-lg">
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
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">{job.job_number}</h1>

      {job.quote_id && (
        <p className="mb-4 text-sm text-slate-500">
          Converted from{" "}
          <Link href={`/quotes/${job.quote_id}`} className="font-medium text-slate-900">
            quote
          </Link>
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={boundUpdateStatus} className="mb-6 flex items-end gap-2">
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={job.status}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {JOB_STATUSES.map((s) => (
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

      <form action={boundUpdate} className="space-y-4">
        <Field label="Product type" name="product_type" defaultValue={job.product_type} />
        <Field label="Assigned to" name="assigned_to" defaultValue={job.assigned_to} />
        <Field label="Due date" name="due_date" type="date" defaultValue={job.due_date} />
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={job.priority ?? "Normal"}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={job.notes ?? ""}
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
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
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
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}
