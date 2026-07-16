import { createClient } from "@/lib/supabase/server";
import { BoardClient, type BoardJob } from "./board-client";
import { JOB_STATUSES } from "../jobs/statuses";

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, job_number, status, due_date, customers(name)")
    .order("due_date", { ascending: true, nullsFirst: false });

  const jobsByStatus: Record<string, BoardJob[]> = {};
  for (const status of JOB_STATUSES) {
    jobsByStatus[status] = [];
  }

  for (const job of jobs ?? []) {
    const customerName = (job.customers as unknown as { name: string } | null)?.name ?? null;
    const entry: BoardJob = {
      id: job.id,
      job_number: job.job_number,
      due_date: job.due_date,
      customerName,
    };
    if (jobsByStatus[job.status]) {
      jobsByStatus[job.status].push(entry);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Production Board</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <BoardClient initialJobsByStatus={jobsByStatus} />
    </div>
  );
}
