import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createJob } from "../actions";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; error?: string }>;
}) {
  const { customerId, error } = await searchParams;
  if (!customerId) notFound();

  const supabase = await createClient();

  const [{ data: customer }, { count }, { data: campaigns }, { data: users }] = await Promise.all([
    supabase.from("customers").select("id, name").eq("id", customerId).single(),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("id, name").eq("customer_id", customerId).order("name"),
    supabase.from("users").select("id, name, email").order("email"),
  ]);

  if (!customer) notFound();

  const suggestedJobNumber = `JOB-${String((count ?? 0) + 1).padStart(4, "0")}`;
  const boundCreate = createJob.bind(null, customerId);

  return (
    <div className="max-w-lg">
      <p className="mb-1 text-sm text-slate-500">Customer: {customer.name}</p>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New job</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={boundCreate} className="space-y-4">
        <div>
          <label htmlFor="job_number" className="mb-1 block text-sm font-medium text-slate-700">
            Job number
          </label>
          <input
            id="job_number"
            name="job_number"
            required
            defaultValue={suggestedJobNumber}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        {campaigns && campaigns.length > 0 && (
          <div>
            <label htmlFor="campaign_id" className="mb-1 block text-sm font-medium text-slate-700">
              Campaign (optional)
            </label>
            <select
              id="campaign_id"
              name="campaign_id"
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">No campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="assigned_to_user_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Assigned to
          </label>
          <select
            id="assigned_to_user_id"
            name="assigned_to_user_id"
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">Unassigned</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="due_date" className="mb-1 block text-sm font-medium text-slate-700">
            Due date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="Normal"
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
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create job
        </button>
      </form>

      <p className="mt-3 text-sm text-slate-500">
        You&apos;ll add items on the next screen.
      </p>
    </div>
  );
}
