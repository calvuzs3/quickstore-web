import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Must not import from @/lib/auth — middleware runs in the Edge runtime
// where next/headers is unavailable. We read cookies directly from the request.

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev_secret_change_in_production"
);

const SESSION_COOKIE = "quickstore_session";
const TOKEN_COOKIE = "quickstore_token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pass through: login page, API routes, Next.js internals, static files
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(sessionCookie, SECRET);
  } catch {
    // Invalid or expired session — clear cookies and send to login
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(SESSION_COOKIE);
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Match everything except Next.js static assets and images
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
