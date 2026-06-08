"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function FertilizeButton({
  id,
  suggestedDose,
}: {
  id: string;
  suggestedDose: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dose, setDose] = useState<number>(Number(suggestedDose.toFixed(1)));
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const res = await fetch(`/api/collection/${id}/fertilize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ doseMl: dose, notes: notes || undefined }),
      });
      if (res.ok) {
        setOpen(false);
        setNotes("");
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        ✅ J'ai fertilisé
      </button>
    );
  }

  return (
    <div className="card p-3 grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end w-full md:w-auto">
      <div>
        <label className="label" htmlFor="dose">Dose (mL)</label>
        <input
          id="dose"
          type="number"
          step={0.1}
          min={0.1}
          className="input"
          value={dose}
          onChange={(e) => setDose(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="label" htmlFor="notes">Notes</label>
        <input
          id="notes"
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ex: engrais NPK 6-3-6"
        />
      </div>
      <button className="btn-primary" onClick={submit} disabled={pending}>
        {pending ? "…" : "Enregistrer"}
      </button>
      <button className="btn-ghost" onClick={() => setOpen(false)} disabled={pending}>
        Annuler
      </button>
    </div>
  );
}
