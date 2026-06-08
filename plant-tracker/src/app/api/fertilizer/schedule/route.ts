import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const userPlants = await prisma.userPlant.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const plantIds = userPlants.map((p) => p.id);

    const schedules = await prisma.fertilizerSchedule.findMany({
      where: { userPlantId: { in: plantIds }, isActive: true },
      include: {
        userPlant: { include: { plant: true } },
      },
      orderBy: { nextDueDate: "asc" },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { userPlantId, fertilizerName, fertilizerNPK, doseMLPerLiter, frequencyDays } = await request.json();

    const userPlant = await prisma.userPlant.findFirst({
      where: { id: userPlantId, userId: user.id },
    });
    if (!userPlant) {
      return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + frequencyDays);

    const schedule = await prisma.fertilizerSchedule.create({
      data: {
        userPlantId,
        fertilizerName,
        fertilizerNPK,
        doseMLPerLiter,
        frequencyDays,
        nextDueDate,
      },
      include: { userPlant: { include: { plant: true } } },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
