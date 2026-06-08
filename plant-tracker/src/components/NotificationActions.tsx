"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CareEventType } from "@/lib/plant-types";

export function NotificationActions({
  id,
  userPlantId,
  type,
}: {
  id: string;
  userPlantId?: string;
  type: CareEventType;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function dismiss() {
    start(async () => {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "DISMISSED" }),
      });
      router.refresh();
    });
  }

  function done() {
    start(async () => {
      // If it's a FERTILIZE notification, log a fert event too.
      if (type === "FERTILIZE" && userPlantId) {
        await fetch(`/api/collection/${userPlantId}/fertilize`, { method: "POST" });
      } else {
        await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: "DONE" }),
        });
      }
      router.refresh();
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={done} disabled={pending}>
        ✅ Fait
      </button>
      <button className="btn-ghost" onClick={dismiss} disabled={pending}>
        Ignorer
      </button>
    </>
  );
}
