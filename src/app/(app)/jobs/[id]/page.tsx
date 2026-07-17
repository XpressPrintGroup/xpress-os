import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  updateJob,
  updateJobStatus,
  addJobItem,
  deleteJobItem,
  addJobActivity,
  deleteJobFile,
} from "../actions";
import { JOB_STATUSES } from "../statuses";
import { AddItemForm } from "./add-item-form";
import { DeleteItemButton } from "./delete-item-button";
import { UploadFileForm } from "./upload-file-form";

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

  const [
    { data: items },
    { data: products },
    { data: suppliers },
    { data: activity },
    { data: campaigns },
    { data: jobFiles },
  ] = await Promise.all([
      supabase
        .from("job_items")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("products").select("id, name").order("name"),
      supabase.from("suppliers").select("id, name").order("name"),
      supabase
        .from("job_activity")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select("id, name")
        .eq("customer_id", job.customer_id)
        .order("name"),
      supabase
        .from("job_files")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: false }),
  ]);

  const files = await Promise.all(
    (jobFiles ?? []).map(async (file) => {
      const { data: signed } = await supabase.storage
        .from("job-files")
        .createSignedUrl(file.storage_path, 60 * 60);
      return { ...file, url: signed?.signedUrl ?? null };
    })
  );

  const boundUpdate = updateJob.bind(null, id, job.customer_id);
  const boundUpdateStatus = updateJobStatus.bind(null, id);
  const boundAddItem = addJobItem.bind(null, id);
  const boundAddActivity = addJobActivity.bind(null, id);

  const currentCampaignName =
    campaigns?.find((c) => c.id === job.campaign_id)?.name ?? null;

  return (
    <div className="max-w-4xl">
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
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
                    <td className="px-4 py-2 text-slate-800">
                      {item.description}
                      {item.is_outsourced && (
                        <>
                          <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Outsourced{item.supplier ? ` — ${item.supplier}` : ""}
                          </span>
                          {(item.supplier_reference || item.supplier_due_date || item.supplier_cost) && (
                            <p className="mt-1 text-xs text-slate-400">
                              {item.supplier_reference && `PO: ${item.supplier_reference}`}
                              {item.supplier_reference && item.supplier_due_date && " · "}
                              {item.supplier_due_date && `Due back ${item.supplier_due_date}`}
                              {(item.supplier_reference || item.supplier_due_date) &&
                                item.supplier_cost &&
                                " · "}
                              {item.supplier_cost && `£${Number(item.supplier_cost).toFixed(2)}`}
                            </p>
                          )}
                        </>
                      )}
                    </td>
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
            <AddItemForm
              action={boundAddItem}
              products={products ?? []}
              suppliers={suppliers ?? []}
            />
          </div>

          <form action={boundUpdate} className="space-y-4">
            {campaigns && campaigns.length > 0 && (
              <div>
                <label
                  htmlFor="campaign_id"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Campaign
                </label>
                <select
                  id="campaign_id"
                  name="campaign_id"
                  defaultValue={job.campaign_id ?? ""}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="">No campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {job.campaign_id && (
                  <Link
                    href={`/campaigns/${job.campaign_id}`}
                    className="mt-1 inline-block text-sm font-medium text-slate-900 hover:underline"
                  >
                    View campaign ↗
                  </Link>
                )}
              </div>
            )}
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

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Files</h2>

          <div className="mb-6">
            <UploadFileForm
              jobId={id}
              customerName={customer?.name ?? "Unknown"}
              campaignName={currentCampaignName}
              jobNumber={job.job_number}
            />
          </div>

          <ul className="mb-8 space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3"
              >
                <div>
                  {file.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {file.original_filename}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-800">{file.original_filename}</span>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {file.uploaded_by ?? "Unknown"} ·{" "}
                    {new Date(file.created_at).toLocaleString()}
                  </p>
                </div>
                <DeleteItemButton
                  action={deleteJobFile.bind(null, file.id, file.storage_path, id)}
                />
              </li>
            ))}
            {files.length === 0 && <p className="text-sm text-slate-400">No files yet.</p>}
          </ul>

          <h2 className="mb-4 text-lg font-semibold text-slate-900">Activity</h2>

          <form action={boundAddActivity} className="mb-6 flex gap-2">
            <input
              name="text"
              placeholder="Log a comment, issue, source, etc..."
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
      </div>
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
