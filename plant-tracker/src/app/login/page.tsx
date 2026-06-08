import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "./AuthForm";

export const metadata = { title: "Connexion · Plant Tracker" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/collection");
  return (
    <div className="max-w-md mx-auto card p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-1">Bon retour 🪴</h1>
      <p className="text-sm text-leaf-700 mb-6">
        Reprenez le suivi de vos plantes là où vous l'avez laissé.
      </p>
      <AuthForm mode="login" />
      <p className="text-sm text-leaf-700 mt-4">
        Pas encore de compte ?{" "}
        <Link className="font-semibold text-leaf-800 underline" href="/signup">
          Créez-en un
        </Link>
        .
      </p>
    </div>
  );
}
