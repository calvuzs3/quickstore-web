import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const { orgName, roleCode } = await requireAuth();

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Benvenuto</h1>
      <p style={{ fontSize: 14, marginBottom: 4 }}>
        Organizzazione: <strong>{orgName}</strong>
      </p>
      <p style={{ fontSize: 14, marginBottom: 16, color: "var(--color-text-muted)" }}>
        Ruolo: {roleCode}
      </p>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        Le schermate dati (articoli, giacenze, movimenti) non sono ancora disponibili
        qui: quickstore-server non espone ancora una REST di lettura puntuale per il
        dominio, solo il pull massivo usato dai device per la sincronizzazione completa.
      </p>
    </div>
  );
}
