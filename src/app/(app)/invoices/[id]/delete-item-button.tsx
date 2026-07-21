"use client";

export function DeleteItemButton({ action }: { action: () => void }) {
  return (
    <form action={action} className="print:hidden">
      <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
        Remove
      </button>
    </form>
  );
}
