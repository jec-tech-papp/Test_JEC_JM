"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function WishlistRemove({ plantId }: { plantId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="badge bg-white border border-leaf-200 hover:bg-red-50 hover:text-red-700"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          await fetch(`/api/wishlist?plantId=${plantId}`, { method: "DELETE" });
          router.refresh();
        });
      }}
    >
      ✕ Retirer
    </button>
  );
}
