import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    // Generate notifications for overdue fertilizer schedules
    const userPlants = await prisma.userPlant.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const plantIds = userPlants.map((p) => p.id);
    const now = new Date();

    const overdueSchedules = await prisma.fertilizerSchedule.findMany({
      where: {
        userPlantId: { in: plantIds },
        isActive: true,
        nextDueDate: { lte: now },
      },
      include: { userPlant: { include: { plant: true, substrate: true } } },
    });

    // Create notifications for overdue items
    for (const schedule of overdueSchedules) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          scheduleId: schedule.id,
          isRead: false,
        },
      });

      if (!existing) {
        const potVolume = schedule.userPlant.potVolumeLiters;
        const waterML = potVolume * 300;
        const doseML = schedule.doseMLPerLiter * (waterML / 1000);
        const nutrientFactor = schedule.userPlant.substrate?.nutrientScore || 1.0;
        const adjustedDose = Math.round((doseML / nutrientFactor) * 100) / 100;

        await prisma.notification.create({
          data: {
            userId: user.id,
            title: `Engrais: ${schedule.userPlant.plant.commonName}`,
            message: `Il est temps de fertiliser ${schedule.userPlant.nickname || schedule.userPlant.plant.commonName}. Dose recommandée: ${adjustedDose}ml de ${schedule.fertilizerName} dans ${waterML}ml d'eau.`,
            type: "fertilizer",
            scheduleId: schedule.id,
          },
        });
      }
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { id } = await request.json();
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
