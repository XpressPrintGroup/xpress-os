export const JOB_STATUSES = [
  "New Enquiry",
  "Quote",
  "Artwork",
  "Proof Sent",
  "Approved",
  "Printing",
  "Ready",
  "Dispatched",
  "Collected",
  "Invoiced",
  "Paid",
  "On Hold",
  "Cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
