import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  try {
    const userPlant = await prisma.userPlant.findFirst({
      where: { id, userId: user.id },
      include: {
        plant: { include: { category: true } },
        substrate: true,
        schedules: true,
        fertilizerLogs: { orderBy: { appliedAt: "desc" }, take: 10 },
        wateringLogs: { orderBy: { wateredAt: "desc" }, take: 10 },
      },
    });

    if (!userPlant) {
      return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
    }

    return NextResponse.json(userPlant);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  try {
    const data = await request.json();
    const userPlant = await prisma.userPlant.updateMany({
      where: { id, userId: user.id },
      data: {
        nickname: data.nickname,
        potVolumeLiters: data.potVolumeLiters,
        potType: data.potType,
        location: data.location,
        substrateId: data.substrateId,
        notes: data.notes,
      },
    });

    return NextResponse.json(userPlant);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.userPlant.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
