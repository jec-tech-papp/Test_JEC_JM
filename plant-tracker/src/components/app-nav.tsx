"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, BookOpen, Sprout, Heart, Beaker, Calendar, Bell, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
}

const navItems = [
  { href: "/library", label: "Bibliothèque", icon: BookOpen },
  { href: "/portfolio", label: "Mes plantes", icon: Sprout },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/substrates", label: "Substrats", icon: Beaker },
  { href: "/schedules", label: "Calendrier", icon: Calendar },
];

export function AppNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/library" className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="text-lg font-bold text-green-900 hidden sm:block">PlantKeeper</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/schedules"
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="h-5 w-5" />
              </Link>

              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                <span className="text-sm text-gray-600">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white border-t border-gray-200">
          <div className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <hr className="my-3" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
}
