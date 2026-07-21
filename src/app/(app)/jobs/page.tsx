import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOB_STATUSES } from "./statuses";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select(
      "id, job_number, status, due_date, priority, customers(name), job_items(description), users(name, email)"
    )
    .order("created_at", { ascending: false });

  if (status?.trim()) {
    query = query.eq("status", status);
  }

  const { data: jobs, error } = await query;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/jobs"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !status
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        {JOB_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/jobs?status=${encodeURIComponent(s)}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              status === s
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Job #</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Items</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Due</th>
              <th className="px-4 py-2 font-medium">Priority</th>
              <th className="px-4 py-2 font-medium">Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.map((job) => (
              <tr key={job.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-0">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block px-4 py-2 font-medium text-slate-900"
                  >
                    {job.job_number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {(job.customers as unknown as { name: string } | null)?.name}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {(job.job_items as unknown as { description: string }[])
                    .map((item) => item.description)
                    .join(", ")}
                </td>
                <td className="px-4 py-2 text-slate-600">{job.status}</td>
                <td className="px-4 py-2 text-slate-600">{job.due_date}</td>
                <td className="px-4 py-2 text-slate-600">{job.priority}</td>
                <td className="px-4 py-2 text-slate-600">
                  {(() => {
                    const assignee = job.users as unknown as {
                      name: string | null;
                      email: string;
                    } | null;
                    return assignee?.name || assignee?.email;
                  })()}
                </td>
              </tr>
            ))}
            {jobs?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
