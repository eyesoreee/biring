import type { ZodType } from "zod";

export type FieldErrors = Record<string, string>;

export function validate<T>(schema: ZodType<T>, values: unknown) {
  const result = schema.safeParse(values);
  if (result.success) return { ok: true as const, data: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false as const, errors };
}

export function friendlyAuthError(message: string) {
  const text = message.toLowerCase();

  if (text.includes("invalid login credentials"))
    return "Email or password is incorrect.";

  if (text.includes("already registered") || text.includes("already exists"))
    return "An account with this email already exists. Sign in instead.";

  if (text.includes("email not confirmed"))
    return "Confirm your email before signing in.";

  if (text.includes("password should be at least"))
    return "Password must be at least 6 characters.";

  if (text.includes("rate limit") || text.includes("too many"))
    return "Too many attempts. Wait a moment and try again.";

  if (text.includes("network") || text.includes("fetch"))
    return "Can't reach the server. Check your connection and try again.";

  return message;
}
