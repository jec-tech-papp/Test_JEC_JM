import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  plantId: z.string().min(1),
  notes: z.string().trim().max(2000).optional(),
  priority: z.number().int().min(1).max(3).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalide" }, { status: 400 });
  const item = await prisma.wishlistItem.upsert({
    where: { userId_plantId: { userId: user.id, plantId: parsed.data.plantId } },
    create: {
      userId: user.id,
      plantId: parsed.data.plantId,
      notes: parsed.data.notes,
      priority: parsed.data.priority ?? 2,
    },
    update: { notes: parsed.data.notes, priority: parsed.data.priority ?? 2 },
  });
  return NextResponse.json({ id: item.id });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const plantId = url.searchParams.get("plantId");
  if (!plantId) return NextResponse.json({ error: "plantId requis" }, { status: 400 });
  await prisma.wishlistItem
    .delete({ where: { userId_plantId: { userId: user.id, plantId } } })
    .catch(() => undefined);
  return NextResponse.json({ ok: true });
}
