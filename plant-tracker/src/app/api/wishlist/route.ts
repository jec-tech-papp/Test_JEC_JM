import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { plant: { include: { category: true } } },
      orderBy: { priority: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { plantId, priority, notes } = await request.json();
    const item = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        plantId,
        priority: priority || 3,
        notes,
      },
      include: { plant: true },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { plantId } = await request.json();
    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, plantId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
