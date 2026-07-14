import { redirect } from "next/navigation";

// Se non autenticato, middleware.ts ha già reindirizzato a /login prima che questa
// pagina venga eseguita — qui arriva solo un utente con sessione valida.
export default function RootPage() {
  redirect("/dashboard");
}
