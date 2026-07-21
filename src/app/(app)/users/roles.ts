export const ROLES = ["admin", "sales", "designer", "production", "accounts", "dispatch"] as const;

export type Role = (typeof ROLES)[number];
