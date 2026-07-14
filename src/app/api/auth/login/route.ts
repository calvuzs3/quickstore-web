import { NextRequest, NextResponse } from "next/server";
import { saveSession } from "@/lib/auth";
import { KTOR_URL } from "@/lib/config";
import type { LoginOrgChoiceResponse, LoginResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const ktorRes = await fetch(`${KTOR_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!ktorRes.ok) {
      return NextResponse.json(
        { error: "Email o password non corretti" },
        { status: 401 }
      );
    }

    // Il server risponde con forme diverse per lo stesso endpoint (token pieno vs
    // pending+organizations), senza un campo discriminatore esplicito — si distingue
    // guardando quale chiave è presente nel JSON (stessa euristica di AuthApi.kt lato
    // Android).
    const json = await ktorRes.json();

    if ("pendingToken" in json) {
      const choice = json as LoginOrgChoiceResponse;
      return NextResponse.json({
        orgChoice: true,
        pendingToken: choice.pendingToken,
        organizations: choice.organizations,
      });
    }

    const full = json as LoginResponse;
    await saveSession(full.token, {
      orgId: full.orgId,
      orgName: full.orgName,
      roleLevel: full.roleLevel,
      roleCode: full.roleCode,
    });

    return NextResponse.json({ ok: true, orgName: full.orgName });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { error: "Errore di connessione al server" },
      { status: 502 }
    );
  }
}
