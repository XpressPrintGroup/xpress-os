export const JOB_STATUSES = [
  "New Enquiry",
  "Quote",
  "Awaiting Deposit",
  "Artwork",
  "Proof Sent",
  "Approved",
  "Printing",
  "Finishing",
  "Ready",
  "Collected",
  "Completed",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
