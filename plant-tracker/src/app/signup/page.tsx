import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "../login/AuthForm";

export const metadata = { title: "Créer un compte · Plant Tracker" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/collection");
  return (
    <div className="max-w-md mx-auto card p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-1">Créer votre serre 🌱</h1>
      <p className="text-sm text-leaf-700 mb-6">
        Quelques secondes pour commencer à cataloguer votre collection.
      </p>
      <AuthForm mode="signup" />
      <p className="text-sm text-leaf-700 mt-4">
        Déjà inscrit ?{" "}
        <Link className="font-semibold text-leaf-800 underline" href="/login">
          Se connecter
        </Link>
        .
      </p>
    </div>
  );
}
