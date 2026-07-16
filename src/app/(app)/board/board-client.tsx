"use client";

import { useState } from "react";
import Link from "next/link";
import { JOB_STATUSES } from "../jobs/statuses";
import { moveJobStatus } from "./actions";

export type BoardJob = {
  id: string;
  job_number: string;
  due_date: string | null;
  customerName: string | null;
};

export function BoardClient({
  initialJobsByStatus,
}: {
  initialJobsByStatus: Record<string, BoardJob[]>;
}) {
  const [jobsByStatus, setJobsByStatus] = useState(initialJobsByStatus);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function moveJob(jobId: string, from: string, to: string) {
    const job = jobsByStatus[from]?.find((j) => j.id === jobId);
    if (!job || from === to) return;

    setJobsByStatus((prev) => ({
      ...prev,
      [from]: prev[from].filter((j) => j.id !== jobId),
      [to]: [...(prev[to] ?? []), job],
    }));

    moveJobStatus(jobId, to).catch(() => {
      setError("Couldn't update status — reverting.");
      setJobsByStatus((prev) => ({
        ...prev,
        [to]: prev[to].filter((j) => j.id !== jobId),
        [from]: [...(prev[from] ?? []), job],
      }));
    });
  }

  function handleDrop(targetStatus: string, e: React.DragEvent) {
    e.preventDefault();
    setDragOverStatus(null);
    const jobId = e.dataTransfer.getData("text/plain");
    if (!jobId) return;

    const sourceStatus = JOB_STATUSES.find((status) =>
      jobsByStatus[status]?.some((j) => j.id === jobId)
    );
    if (sourceStatus) moveJob(jobId, sourceStatus, targetStatus);
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="grid h-[calc(100vh-180px)] auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {JOB_STATUSES.map((status, statusIndex) => {
          const nextStatus = JOB_STATUSES[statusIndex + 1];

          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStatus(status);
              }}
              onDragLeave={() =>
                setDragOverStatus((current) => (current === status ? null : current))
              }
              onDrop={(e) => handleDrop(status, e)}
              className={`flex min-h-0 flex-col overflow-hidden rounded-lg border p-2 ${
                dragOverStatus === status
                  ? "border-slate-400 bg-slate-100"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="mb-2 flex shrink-0 items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-700">
                  {status}{" "}
                  <span className="text-slate-400">({jobsByStatus[status]?.length ?? 0})</span>
                </h2>
                <Link
                  href={`/jobs?status=${encodeURIComponent(status)}`}
                  title="View full list"
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {(jobsByStatus[status] ?? []).map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", job.id);
                    }}
                    className="cursor-grab rounded-md border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {job.job_number}
                      </Link>
                      {nextStatus && (
                        <button
                          type="button"
                          title={`Move to ${nextStatus}`}
                          onClick={() => moveJob(job.id, status, nextStatus)}
                          className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{job.customerName}</p>
                    {job.due_date && (
                      <p className="mt-1 text-xs text-slate-400">Due {job.due_date}</p>
                    )}
                  </div>
                ))}
                {(jobsByStatus[status] ?? []).length === 0 && (
                  <p className="px-1 text-xs text-slate-400">No jobs</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
