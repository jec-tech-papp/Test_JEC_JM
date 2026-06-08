import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { computeFertilization } from "@/lib/fertilizer";
import type { FeederLevel } from "@/lib/plant-types";

const schema = z.object({
  plantId: z.string().min(1),
  substrateId: z.string().min(1),
  nickname: z.string().trim().max(80).optional(),
  location: z.string().trim().max(120).optional(),
  potVolumeL: z.number().positive().max(200),
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalide" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const [plant, substrate] = await Promise.all([
    prisma.plant.findUnique({ where: { id: data.plantId } }),
    prisma.substrate.findUnique({ where: { id: data.substrateId } }),
  ]);
  if (!plant || !substrate) {
    return NextResponse.json({ error: "Plante ou substrat inconnu" }, { status: 404 });
  }

  const fert = computeFertilization({
    potVolumeL: data.potVolumeL,
    baseDoseMlPerLiter: plant.baseDoseMlPerLiter,
    feeder: plant.feeder as FeederLevel,
    fertFrequencyDaysSummer: plant.fertFrequencyDaysSummer,
    fertFrequencyDaysWinter: plant.fertFrequencyDaysWinter,
    fertMultiplier: substrate.fertMultiplier,
    fertFrequencyShiftDays: substrate.fertFrequencyShiftDays,
  });

  const userPlant = await prisma.userPlant.create({
    data: {
      userId: user.id,
      plantId: data.plantId,
      substrateId: data.substrateId,
      nickname: data.nickname,
      location: data.location,
      potVolumeL: data.potVolumeL,
      notes: data.notes,
      nextFertilizeAt: fert.nextDate,
    },
  });

  // Schedule a notification for the first fertilization.
  await prisma.notification.create({
    data: {
      userId: user.id,
      userPlantId: userPlant.id,
      title: `Fertiliser ${data.nickname || plant.commonName}`,
      body: `${fert.doseMl.toFixed(1)} mL d'engrais dans ~${(fert.irrigationVolumeMl / 1000).toFixed(2)} L d'eau.`,
      dueAt: fert.nextDate,
      type: "FERTILIZE",
    },
  });

  return NextResponse.json({ id: userPlant.id });
}
