import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Plant Tracker — Mes plantes, mes soins",
  description:
    "Suivez votre collection de plantes, planifiez les fertilisations avec la dose parfaite selon votre pot et votre substrat.",
};

export const viewport: Viewport = {
  themeColor: "#2e6f2e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const pendingCount = user
    ? await prisma.notification.count({
        where: { userId: user.id, status: "PENDING", dueAt: { lte: new Date() } },
      })
    : 0;

  return (
    <html lang="fr">
      <body className="min-h-screen">
        <NavBar user={user} pendingCount={pendingCount} />
        <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</main>
        <footer className="border-t border-leaf-100 mt-12">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-leaf-600 flex flex-col md:flex-row gap-2 justify-between">
            <span>
              Plant Tracker · pour les <em>plant addicts</em> exigeants.
            </span>
            <span>
              Bibliothèque de soin indicative — adaptez selon votre environnement.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
