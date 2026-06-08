// Cron endpoint: scans pending notifications whose dueAt <= now and have not
// been sent yet, sends a Web Push if VAPID is configured, and marks them
// as SENT (without changing PENDING status — user still needs to mark
// the task done in the UI).
//
// Trigger it periodically (e.g. every 5 min) via a cron service such as
// Vercel Cron, GitHub Actions, or a simple cURL hook:
//
//   curl -H "x-cron-secret: $CRON_SECRET" https://your.app/api/cron/dispatch
//
// Protect with the optional CRON_SECRET env var.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToUser, isPushConfigured } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = req.headers.get("x-cron-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const due = await prisma.notification.findMany({
    where: { status: "PENDING", dueAt: { lte: now } },
    take: 200,
  });

  let pushed = 0;
  if (isPushConfigured()) {
    for (const n of due) {
      await sendPushToUser(n.userId, {
        title: n.title,
        body: n.body,
        url: n.userPlantId ? `/collection/${n.userPlantId}` : "/notifications",
      });
      pushed += 1;
    }
  }

  await prisma.notification.updateMany({
    where: { id: { in: due.map((n) => n.id) } },
    data: { status: "SENT" },
  });

  return NextResponse.json({
    scanned: due.length,
    pushed,
    pushConfigured: isPushConfigured(),
  });
}
