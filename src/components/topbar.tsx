import { logout } from "@/app/login/actions";

export function Topbar({ email }: { email: string | undefined }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">{email}</span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
