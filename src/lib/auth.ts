import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev_secret_change_in_production"
);

// quickstore_session: HMAC-signed JWT containing {orgId, orgName, roleLevel, roleCode}
// — these values came from Ktor's /auth/login (or /auth/select-org) response and cannot
// be tampered without SESSION_SECRET.
// quickstore_token:   raw Ktor JWT forwarded on every backend call.
const SESSION_COOKIE = "quickstore_session";
const TOKEN_COOKIE = "quickstore_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, matching Ktor expiry

export interface Session {
  token: string;
  orgId: string;
  orgName: string;
  roleLevel: number;
  roleCode: string;
}

export interface SessionClaims {
  orgId: string;
  orgName: string;
  roleLevel: number;
  roleCode: string;
}

// ─── Save session ─────────────────────────────────────────────────────────────

export async function saveSession(token: string, claims: SessionClaims): Promise<void> {
  // Sign the claims with our own secret. Values came directly from Ktor's
  // /auth/login (or /auth/select-org) response — this is the "real" data, now
  // cryptographically bound so middleware (Edge runtime) can trust it without
  // re-verifying the Ktor JWT itself.
  const signed = await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);

  const store = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
  store.set(SESSION_COOKIE, signed, opts);
  store.set(TOKEN_COOKIE, token, opts);
}

// ─── Clear session ────────────────────────────────────────────────────────────

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(TOKEN_COOKIE);
}

// ─── Verified session ─────────────────────────────────────────────────────────

// Verifies the HMAC signature of the session cookie. Returns null if missing,
// tampered, or expired — never trusts the raw JWT payload without verification.
export async function getVerifiedSession(): Promise<Session | null> {
  const store = await cookies();
  const signed = store.get(SESSION_COOKIE)?.value;
  const token = store.get(TOKEN_COOKIE)?.value;

  if (!signed || !token) return null;

  try {
    const { payload } = await jwtVerify(signed, SECRET);
    return {
      token,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string,
      roleLevel: payload.roleLevel as number,
      roleCode: payload.roleCode as string,
    };
  } catch {
    return null;
  }
}

// ─── Raw Ktor token (for api.ts) ──────────────────────────────────────────────

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

// ─── Guards ───────────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<Session> {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");
  return session;
}
