// Re-export auth-related types and tables from the main schema
// This avoids duplicate table definitions
export { users, sessions } from "../schema";

export type UpsertUser = {
  id?: string;
  email?: string | null;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

export type User = {
  id: string;
  email: string | null;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
