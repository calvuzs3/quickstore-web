import { NextRequest, NextResponse } from "next/server";
import { saveSession } from "@/lib/auth";
import { KTOR_URL } from "@/lib/config";
import type { LoginResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { pendingToken, orgId } = await req.json();

    const ktorRes = await fetch(`${KTOR_URL}/auth/select-org`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({ orgId }),
    });

    if (!ktorRes.ok) {
      return NextResponse.json(
        { error: "Selezione organizzazione non riuscita" },
        { status: 401 }
      );
    }

    const full = (await ktorRes.json()) as LoginResponse;
    await saveSession(full.token, {
      orgId: full.orgId,
      orgName: full.orgName,
      roleLevel: full.roleLevel,
      roleCode: full.roleCode,
    });

    return NextResponse.json({ ok: true, orgName: full.orgName });
  } catch (err) {
    console.error("[select-org]", err);
    return NextResponse.json(
      { error: "Errore di connessione al server" },
      { status: 502 }
    );
  }
}
