import { requireAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireAuth verifica il cookie di sessione firmato HMAC; redirect a /login se non valido
  const { orgName, roleLevel, roleCode } = await requireAuth();

  return (
    <div className={styles.shell}>
      <Sidebar orgName={orgName} roleLevel={roleLevel} roleCode={roleCode} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
