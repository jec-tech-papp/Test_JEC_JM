import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { commonName: { contains: search } },
        { scientificName: { contains: search } },
        { family: { contains: search } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const plants = await prisma.plant.findMany({
      where,
      include: { category: true },
      orderBy: { commonName: "asc" },
    });

    return NextResponse.json(plants);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des plantes" }, { status: 500 });
  }
}
