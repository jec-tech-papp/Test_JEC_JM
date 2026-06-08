import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const components = await prisma.substrateComponent.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(components);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
