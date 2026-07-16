export const QUOTE_STATUSES = ["Draft", "Sent", "Accepted", "Declined"] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
