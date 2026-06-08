import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const plant = await prisma.plant.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!plant) {
      return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
    }

    return NextResponse.json(plant);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
