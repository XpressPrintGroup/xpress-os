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

  const [{ data: customer }, { count }] = await Promise.all([
    supabase.from("customers").select("id, name").eq("id", customerId).single(),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
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

        <div>
          <label htmlFor="product_type" className="mb-1 block text-sm font-medium text-slate-700">
            Product type
          </label>
          <input
            id="product_type"
            name="product_type"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="assigned_to" className="mb-1 block text-sm font-medium text-slate-700">
            Assigned to
          </label>
          <input
            id="assigned_to"
            name="assigned_to"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
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
    </div>
  );
}
