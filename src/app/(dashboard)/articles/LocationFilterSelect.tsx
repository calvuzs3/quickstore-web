"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Location } from "@/types";

interface LocationFilterSelectProps {
  locations: Location[];
  selectedLocationId?: string;
}

// Selettore "Tutti i magazzini / <ubicazione>" — stesso ruolo del filtro Magazzino
// nella lista articoli su Android (ArticleListScreen). Componente client separato dal
// resto della pagina (Server Component) solo perché deve navigare on-change; il form
// di ricerca testuale accanto resta un normale <form method="GET"> invariato.
export default function LocationFilterSelect({ locations, selectedLocationId }: LocationFilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("locationId", e.target.value);
    } else {
      params.delete("locationId");
    }
    params.delete("page"); // il filtro cambia il risultato: si riparte dalla prima pagina
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="form-select"
      value={selectedLocationId ?? ""}
      onChange={handleChange}
      aria-label="Filtra per magazzino"
    >
      <option value="">Tutti i magazzini</option>
      {locations.map(location => (
        <option key={location.id} value={location.id}>{location.name}</option>
      ))}
    </select>
  );
}
