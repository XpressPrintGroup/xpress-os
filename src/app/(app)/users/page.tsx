import { createClient } from "@/lib/supabase/server";
import { updateUserProfile } from "./actions";

const ROLES = ["admin", "sales", "designer", "production", "accounts"];

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, name, role")
    .order("email");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Users</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => {
              const formId = `user-form-${user.id}`;
              return (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-800">{user.email}</td>
                  <td className="px-4 py-2">
                    {/* Empty form associated via the `form` attribute below, since a
                        <form> can't legally wrap <td> siblings inside a <tr>. */}
                    <form id={formId} action={updateUserProfile.bind(null, user.id)} />
                    <input
                      form={formId}
                      name="name"
                      defaultValue={user.name ?? ""}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      form={formId}
                      name="role"
                      defaultValue={user.role}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      form={formId}
                      type="submit"
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
            {users?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
