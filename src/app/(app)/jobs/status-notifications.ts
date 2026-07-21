import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobStatus } from "./statuses";
import type { Role } from "../users/roles";

// Maps a job status to the role that should be notified when a job reaches it —
// each role gets pinged exactly once, at the moment work lands in their court.
export const STATUS_NOTIFY_ROLE: Partial<Record<JobStatus, Role>> = {
  "New Enquiry": "sales",
  Artwork: "designer",
  Approved: "production",
  Ready: "dispatch",
  Collected: "accounts",
  "On Hold": "sales",
  Cancelled: "sales",
};

const STATUS_MESSAGE: Partial<Record<JobStatus, (jobNumber: string) => string>> = {
  "New Enquiry": (n) => `New enquiry ${n} — give them a shout 👋`,
  Artwork: (n) => `${n} is all yours — time to get creative 🎨`,
  Approved: (n) => `${n} got the thumbs up — send it to print 🖨️`,
  Ready: (n) => `${n} is boxed up and ready to go 📦`,
  Collected: (n) => `${n} is out the door — go ahead and invoice 💷`,
  "On Hold": (n) => `${n} is stuck — can you help clear the way? ⏸️`,
  Cancelled: (n) => `${n} was cancelled — worth a follow-up`,
};

export async function notifyRoleOfStatusChange(
  supabase: SupabaseClient,
  jobId: string,
  status: string
) {
  const role = STATUS_NOTIFY_ROLE[status as JobStatus];
  if (!role) return;

  const [{ data: job }, { data: recipients }] = await Promise.all([
    supabase.from("jobs").select("job_number").eq("id", jobId).single(),
    supabase.from("users").select("id").eq("role", role),
  ]);

  if (!job || !recipients || recipients.length === 0) return;

  const message =
    STATUS_MESSAGE[status as JobStatus]?.(job.job_number) ?? `Job ${job.job_number} is now ${status}`;

  await supabase.from("notifications").insert(
    recipients.map((r) => ({
      user_id: r.id,
      message,
      link: `/jobs/${jobId}`,
    }))
  );
}
