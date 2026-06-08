import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AppNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
