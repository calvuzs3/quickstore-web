import LoginForm from "./LoginForm";
import { getSessionToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const token = await getSessionToken();
  if (token) redirect("/dashboard");

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg)",
    }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--color-primary)",
            color: "var(--color-on-primary-button)",
            marginBottom: 12,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7L12 3 4 7v10l8 4 8-4V7z" />
              <path d="M4 7l8 4 8-4" />
              <path d="M12 11v10" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>QuickStore</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Gestione magazzino
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
