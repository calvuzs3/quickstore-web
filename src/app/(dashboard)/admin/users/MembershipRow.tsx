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

  const [editingProfile, setEditingProfile] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(membership.displayName ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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

  async function handleSaveProfile() {
    setProfileError(null);
    if (newPassword && newPassword.length < 8) {
      setProfileError("La password deve avere almeno 8 caratteri.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${membership.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayNameInput || null,
          ...(newPassword ? { password: newPassword } : {}),
        }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      setNewPassword("");
      setEditingProfile(false);
      router.refresh();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Errore salvataggio");
    } finally {
      setSavingProfile(false);
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
      <td>
        {editingProfile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
            <input
              type="text"
              className="form-input"
              value={displayNameInput}
              onChange={e => setDisplayNameInput(e.target.value)}
              placeholder="Nome"
              disabled={savingProfile}
            />
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nuova password (opzionale)"
              disabled={savingProfile}
            />
            {profileError && (
              <div style={{ color: "var(--color-danger)", fontSize: 12 }}>{profileError}</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? "…" : "Salva"}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingProfile(false);
                  setDisplayNameInput(membership.displayName ?? "");
                  setNewPassword("");
                  setProfileError(null);
                }}
                disabled={savingProfile}
              >
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{membership.displayName ?? "—"}</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEditingProfile(true)}
            >
              Modifica
            </button>
          </div>
        )}
      </td>
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
