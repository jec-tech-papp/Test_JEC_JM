import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NOTIFICATION_STATUSES, type NotificationStatus } from "@/lib/plant-types";

const schema = z.object({
  status: z.enum(NOTIFICATION_STATUSES),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const existing = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalide" }, { status: 400 });
  const status: NotificationStatus = parsed.data.status;
  await prisma.notification.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json({ ok: true });
}
