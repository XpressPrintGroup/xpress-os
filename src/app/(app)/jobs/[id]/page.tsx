import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateJob, updateJobStatus, addJobItem, deleteJobItem } from "../actions";
import { JOB_STATUSES } from "../statuses";
import { AddItemForm } from "./add-item-form";
import { DeleteItemButton } from "./delete-item-button";

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

  const [{ data: items }, { data: products }] = await Promise.all([
    supabase
      .from("job_items")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("products").select("id, name").order("name"),
  ]);

  const boundUpdate = updateJob.bind(null, id, job.customer_id);
  const boundUpdateStatus = updateJobStatus.bind(null, id);
  const boundAddItem = addJobItem.bind(null, id);

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
        <p className="mb-6 text-sm text-slate-500">
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

      <h2 className="mb-3 text-lg font-semibold text-slate-900">Items</h2>

      <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-800">{item.description}</td>
                <td className="px-4 py-2 text-slate-600">{item.quantity}</td>
                <td className="px-4 py-2">
                  <DeleteItemButton action={deleteJobItem.bind(null, item.id, id)} />
                </td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  No items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <AddItemForm action={boundAddItem} products={products ?? []} />
      </div>

      <form action={boundUpdate} className="space-y-4">
        <Field label="Assigned to" name="assigned_to" defaultValue={job.assigned_to} />
        <Field label="Due date" name="due_date" type="date" defaultValue={job.due_date} />
        <div>
          <label
            htmlFor="tracking_number"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Tracking number / link
          </label>
          <input
            id="tracking_number"
            name="tracking_number"
            defaultValue={job.tracking_number ?? ""}
            placeholder="Paste the courier's tracking number or link"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          {job.tracking_number?.startsWith("http") && (
            <a
              href={job.tracking_number}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-slate-900 hover:underline"
            >
              Track package ↗
            </a>
          )}
        </div>
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
