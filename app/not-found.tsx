import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid-c py-32">
      <h1 className="text-3xl font-semibold text-zinc-100">Page introuvable</h1>
      <p className="mt-2 text-zinc-400">Le contenu demandé n’existe pas (ou plus).</p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-zinc-700/60 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
