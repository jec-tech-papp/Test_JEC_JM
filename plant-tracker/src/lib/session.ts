import { redirect } from "next/navigation";
import { prisma } from "./db";
import { readSessionFromCookie } from "./auth";

export async function getCurrentUser() {
  const session = await readSessionFromCookie();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
