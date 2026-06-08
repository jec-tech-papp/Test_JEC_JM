"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeletePlantButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="btn-ghost text-red-700 hover:bg-red-50"
      disabled={pending}
      onClick={() => {
        if (!confirm("Retirer cette plante de votre collection ?")) return;
        start(async () => {
          const res = await fetch(`/api/collection/${id}`, { method: "DELETE" });
          if (res.ok) {
            router.push("/collection");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "…" : "Retirer"}
    </button>
  );
}
