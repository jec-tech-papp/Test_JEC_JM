"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function EditCollectionForm({
  userPlant,
  substrates,
}: {
  userPlant: {
    id: string;
    nickname: string;
    location: string;
    potVolumeL: number;
    substrateId: string;
    notes: string;
  };
  substrates: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [nickname, setNickname] = useState(userPlant.nickname);
  const [location, setLocation] = useState(userPlant.location);
  const [potVolumeL, setPotVolumeL] = useState(userPlant.potVolumeL);
  const [substrateId, setSubstrateId] = useState(userPlant.substrateId);
  const [notes, setNotes] = useState(userPlant.notes);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function save() {
    setMsg(null);
    start(async () => {
      const res = await fetch(`/api/collection/${userPlant.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nickname: nickname || null,
          location: location || null,
          potVolumeL,
          substrateId,
          notes: notes || null,
        }),
      });
      if (res.ok) {
        setMsg("Enregistré.");
        router.refresh();
      } else setMsg("Erreur.");
    });
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Surnom</label>
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </div>
        <div>
          <label className="label">Emplacement</label>
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="label">Volume (L)</label>
          <input
            type="number"
            step={0.05}
            min={0.05}
            className="input"
            value={potVolumeL}
            onChange={(e) => setPotVolumeL(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Substrat</label>
          <select
            className="select"
            value={substrateId}
            onChange={(e) => setSubstrateId(e.target.value)}
          >
            {substrates.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="textarea"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observations, traitements, repiquage…"
        />
      </div>
      <div className="flex justify-end items-center gap-3">
        {msg && <span className="text-xs text-leaf-700">{msg}</span>}
        <button onClick={save} className="btn-secondary" disabled={pending}>
          {pending ? "…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
