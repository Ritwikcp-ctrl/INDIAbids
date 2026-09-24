export type AuthRole = "USER" | "ADMIN";

export interface AuthContext {
  userId: string;
  role: AuthRole;
  sessionId: string;
}
