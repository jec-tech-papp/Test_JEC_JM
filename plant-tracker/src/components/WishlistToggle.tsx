"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function WishlistToggle({
  plantId,
  initial,
}: {
  plantId: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [inList, setInList] = useState(initial);
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      if (inList) {
        const res = await fetch(`/api/wishlist?plantId=${plantId}`, {
          method: "DELETE",
        });
        if (res.ok) setInList(false);
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plantId }),
        });
        if (res.ok) setInList(true);
      }
      router.refresh();
    });
  }

  return (
    <button onClick={toggle} disabled={pending} className={inList ? "btn-secondary" : "btn-ghost"}>
      {inList ? "💚 Retirer de la wishlist" : "🤍 Ajouter à la wishlist"}
    </button>
  );
}
