import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { computeFertilization } from "@/lib/fertilizer";
import type { FeederLevel } from "@/lib/plant-types";

const schema = z.object({
  doseMl: z.number().positive().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userPlant = await prisma.userPlant.findUnique({
    where: { id: params.id },
    include: { plant: true, substrate: true },
  });
  if (!userPlant || userPlant.userId !== user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalide" }, { status: 400 });
  }

  const now = new Date();
  const fert = computeFertilization({
    potVolumeL: userPlant.potVolumeL,
    baseDoseMlPerLiter: userPlant.plant.baseDoseMlPerLiter,
    feeder: userPlant.plant.feeder as FeederLevel,
    fertFrequencyDaysSummer: userPlant.plant.fertFrequencyDaysSummer,
    fertFrequencyDaysWinter: userPlant.plant.fertFrequencyDaysWinter,
    fertMultiplier: userPlant.substrate.fertMultiplier,
    fertFrequencyShiftDays: userPlant.substrate.fertFrequencyShiftDays,
    now,
  });

  const doseMl = parsed.data.doseMl ?? fert.doseMl;

  // Log the event
  await prisma.careEvent.create({
    data: {
      userPlantId: userPlant.id,
      type: "FERTILIZE",
      occurredAt: now,
      doseMl,
      waterAmountMl: fert.irrigationVolumeMl,
      notes: parsed.data.notes,
    },
  });

  await prisma.userPlant.update({
    where: { id: userPlant.id },
    data: {
      lastFertilizedAt: now,
      nextFertilizeAt: fert.nextDate,
    },
  });

  // Mark any pending FERTILIZE notification done, then schedule next.
  await prisma.notification.updateMany({
    where: {
      userPlantId: userPlant.id,
      type: "FERTILIZE",
      status: "PENDING",
    },
    data: { status: "DONE" },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      userPlantId: userPlant.id,
      title: `Fertiliser ${userPlant.nickname || userPlant.plant.commonName}`,
      body: `${fert.doseMl.toFixed(1)} mL d'engrais dans ~${(fert.irrigationVolumeMl / 1000).toFixed(2)} L d'eau.`,
      dueAt: fert.nextDate,
      type: "FERTILIZE",
    },
  });

  return NextResponse.json({ ok: true, nextFertilizeAt: fert.nextDate });
}
