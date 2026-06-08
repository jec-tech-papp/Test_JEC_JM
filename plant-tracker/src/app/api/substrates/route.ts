import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const substrates = await prisma.userSubstrate.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(substrates);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { name, description, composition } = await request.json();

    // Calculate scores from composition
    let retentionScore = 0;
    let drainageScore = 0;
    let nutrientScore = 0;

    const components = await prisma.substrateComponent.findMany();
    const parsedComposition = composition as Array<{ componentId: string; percentage: number }>;

    for (const item of parsedComposition) {
      const component = components.find((c) => c.id === item.componentId);
      if (component) {
        const weight = item.percentage / 100;
        retentionScore += component.retentionFactor * weight;
        drainageScore += component.drainageFactor * weight;
        nutrientScore += component.nutrientFactor * weight;
      }
    }

    const substrate = await prisma.userSubstrate.create({
      data: {
        name,
        description,
        composition: JSON.stringify(parsedComposition),
        retentionScore: Math.round(retentionScore * 100) / 100,
        drainageScore: Math.round(drainageScore * 100) / 100,
        nutrientScore: Math.round(nutrientScore * 100) / 100,
      },
    });

    return NextResponse.json(substrate);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
