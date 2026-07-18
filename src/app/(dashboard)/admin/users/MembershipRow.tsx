"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Membership } from "@/types";
import { MEMBERSHIP_ROLES } from "@/types";
import { readErrorMessage } from "@/lib/clientErrors";

export default function MembershipRow({ membership }: { membership: Membership }) {
  const router = useRouter();
  const [roleLevel, setRoleLevel] = useState(membership.roleLevel);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleChanged = roleLevel !== membership.roleLevel;

  async function handleSaveRole() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/memberships/${membership.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleLevel }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio ruolo");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`Rimuovere ${membership.email} da questa organizzazione?`)) return;
    setError(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/memberships/${membership.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore rimozione");
      setRemoving(false);
    }
  }

  return (
    <tr>
      <td>{membership.email}</td>
      <td>{membership.displayName ?? "—"}</td>
      <td>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="form-select"
            value={roleLevel}
            onChange={e => setRoleLevel(Number(e.target.value))}
            disabled={saving || removing}
          >
            {MEMBERSHIP_ROLES.map(role => (
              <option key={role.level} value={role.level}>{role.label}</option>
            ))}
          </select>
          {roleChanged && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSaveRole}
              disabled={saving || removing}
            >
              {saving ? "…" : "Salva"}
            </button>
          )}
        </div>
        {error && <div style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{error}</div>}
      </td>
      <td style={{ textAlign: "right" }}>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleRemove}
          disabled={saving || removing}
        >
          {removing ? "…" : "Rimuovi"}
        </button>
      </td>
    </tr>
  );
}
