"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";
import { buildJobFilePath } from "../file-path";
import { recordJobFile } from "../actions";

export function UploadFileForm({
  jobId,
  customerName,
  campaignName,
  jobNumber,
}: {
  jobId: string;
  customerName: string;
  campaignName: string | null;
  jobNumber: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const path = buildJobFilePath(customerName, campaignName, jobNumber, file.name);
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not signed in");

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 1000, 3000, 5000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
            "x-upsert": "false",
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: "job-files",
            objectName: path,
            contentType: file.type || "application/octet-stream",
            cacheControl: "3600",
          },
          chunkSize: 6 * 1024 * 1024,
          onError: reject,
          onProgress: (sent, total) => setProgress(Math.round((sent / total) * 100)),
          onSuccess: () => resolve(),
        });

        upload.findPreviousUploads().then((previous) => {
          if (previous.length > 0) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        });
      });

      await recordJobFile(jobId, path, file.name);

      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-2 flex items-end gap-2">
      <input
        ref={inputRef}
        name="file"
        type="file"
        required
        disabled={uploading}
        className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
      />
      <button
        type="submit"
        disabled={uploading}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {uploading ? `Uploading... ${progress}%` : "Upload"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
