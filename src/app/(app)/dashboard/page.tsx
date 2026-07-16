import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOB_STATUSES } from "../jobs/statuses";

const DONE_STATUSES = new Set(["Collected", "Invoiced", "Paid", "Cancelled"]);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, job_number, status, due_date, customers(name)")
    .order("due_date", { ascending: true, nullsFirst: false });

  const today = todayISO();
  const weekFromNow = addDaysISO(7);

  const statusCounts: Record<string, number> = {};
  for (const status of JOB_STATUSES) statusCounts[status] = 0;

  const activeJobs = (jobs ?? []).filter((job) => !DONE_STATUSES.has(job.status));
  for (const job of jobs ?? []) {
    if (statusCounts[job.status] !== undefined) statusCounts[job.status]++;
  }

  const overdueJobs = activeJobs.filter((job) => job.due_date && job.due_date < today);
  const dueTodayJobs = activeJobs.filter((job) => job.due_date === today);
  const dueThisWeekJobs = activeJobs.filter(
    (job) => job.due_date && job.due_date > today && job.due_date <= weekFromNow
  );
  const upcomingJobs = activeJobs.filter((job) => job.due_date && job.due_date >= today).slice(0, 8);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Overdue" value={overdueJobs.length} tone="red" />
        <StatTile label="Due today" value={dueTodayJobs.length} tone="amber" />
        <StatTile label="Due this week" value={dueThisWeekJobs.length} tone="blue" />
        <StatTile label="Active jobs" value={activeJobs.length} tone="slate" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">By status</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {JOB_STATUSES.map((status) => (
                <li key={status}>
                  <Link
                    href={`/jobs?status=${encodeURIComponent(status)}`}
                    className="flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="text-slate-700">{status}</span>
                    <span className="font-medium text-slate-900">{statusCounts[status]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Upcoming</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Job #</th>
                  <th className="px-4 py-2 font-medium">Customer</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {upcomingJobs.map((job) => (
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
                    <td className="px-4 py-2 text-slate-600">{job.status}</td>
                    <td className="px-4 py-2 text-slate-600">{job.due_date}</td>
                  </tr>
                ))}
                {upcomingJobs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      Nothing due soon.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber" | "blue" | "slate";
}) {
  const toneClasses = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-white text-slate-900",
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${toneClasses}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
