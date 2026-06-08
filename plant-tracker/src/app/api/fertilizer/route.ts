import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { userPlantId, fertilizerName, doseML, notes } = await request.json();

    // Verify ownership
    const userPlant = await prisma.userPlant.findFirst({
      where: { id: userPlantId, userId: user.id },
    });
    if (!userPlant) {
      return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
    }

    const log = await prisma.fertilizerLog.create({
      data: { userPlantId, fertilizerName, doseML, notes },
    });

    // Update next due date for active schedules
    const schedules = await prisma.fertilizerSchedule.findMany({
      where: { userPlantId, isActive: true },
    });

    for (const schedule of schedules) {
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + schedule.frequencyDays);
      await prisma.fertilizerSchedule.update({
        where: { id: schedule.id },
        data: { nextDueDate: nextDue },
      });
    }

    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
