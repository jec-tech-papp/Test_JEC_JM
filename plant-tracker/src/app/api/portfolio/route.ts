import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const plants = await prisma.userPlant.findMany({
      where: { userId: user.id },
      include: {
        plant: { include: { category: true } },
        substrate: true,
        schedules: { where: { isActive: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(plants);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const data = await request.json();
    const userPlant = await prisma.userPlant.create({
      data: {
        userId: user.id,
        plantId: data.plantId,
        nickname: data.nickname,
        potVolumeLiters: data.potVolumeLiters || 2.0,
        potType: data.potType,
        location: data.location,
        substrateId: data.substrateId,
        notes: data.notes,
      },
      include: { plant: true, substrate: true },
    });

    return NextResponse.json(userPlant);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
  }
}
