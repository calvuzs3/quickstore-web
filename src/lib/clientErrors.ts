// Le route /api/memberships/* (via proxyRequest) inoltrano il corpo così com'è dal
// server Ktor: gli errori di MembershipRoutes.kt arrivano come testo semplice
// (`call.respond(status, result.reason)`, non JSON — vedi CLAUDE.md di
// quickstore-server), mentre gli errori generati dal proxy stesso (401/502) sono
// JSON `{error}`. Questo helper gestisce entrambi i casi senza assumere il formato.
export async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return String(parsed.error);
    }
  } catch {
    // Non era JSON: era proprio il testo semplice del server Ktor, usalo così com'è.
  }
  return text || `Errore ${res.status}`;
}
