import { requireAdmin } from "@/lib/auth";
import { getMemberships } from "@/lib/api";
import InviteMembershipForm from "./InviteMembershipForm";
import MembershipRow from "./MembershipRow";

export default async function AdminUsersPage() {
  await requireAdmin();

  let memberships: Awaited<ReturnType<typeof getMemberships>> = [];
  let error: string | null = null;

  try {
    memberships = await getMemberships();
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento utenti";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Utenti</h1>
          <p className="page-subtitle">{memberships.length} utenti in questa organizzazione</p>
        </div>
      </div>

      <InviteMembershipForm />

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nome</th>
              <th>Ruolo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {memberships.map(membership => (
              <MembershipRow key={membership.id} membership={membership} />
            ))}
            {memberships.length === 0 && !error && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                  Nessun utente trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
