import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type User = { id: string; email: string; name: string | null } | null;

export function NavBar({
  user,
  pendingCount,
}: {
  user: User;
  pendingCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-leaf-100">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-leaf-700">
          <span className="text-2xl" aria-hidden>
            🪴
          </span>
          <span className="hidden sm:inline">Plant Tracker</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/library" className="btn-ghost">
            Bibliothèque
          </Link>
          {user ? (
            <>
              <Link href="/collection" className="btn-ghost">
                Ma collection
              </Link>
              <Link href="/wishlist" className="btn-ghost">
                Wishlist
              </Link>
              <Link
                href="/notifications"
                className="btn-ghost relative"
                aria-label="Notifications"
              >
                Rappels
                {pendingCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] min-w-[1.25rem] h-5 px-1.5 font-bold">
                    {pendingCount}
                  </span>
                )}
              </Link>
              <span className="hidden md:inline mx-2 text-xs text-leaf-500">
                {user.name || user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Connexion
              </Link>
              <Link href="/signup" className="btn-primary">
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
