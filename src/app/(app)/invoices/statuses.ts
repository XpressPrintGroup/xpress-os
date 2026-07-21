export const INVOICE_STATUSES = ["Draft", "Sent", "Paid"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
