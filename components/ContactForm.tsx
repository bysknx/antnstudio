"use client";

type Props = { className?: string };

export function ContactForm({ className = "" }: Props) {
  return (
    <form
      className={`space-y-4 rounded-2xl p-5 ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className="text-lg font-semibold text-zinc-100">Contact</h2>

      <label className="block text-xs text-zinc-400">
        Votre nom
        <input
          className="mt-1 w-full rounded-md bg-zinc-900/50 border border-white/10 p-2 text-sm text-zinc-200"
          placeholder="John Doe"
          type="text"
          name="name"
        />
      </label>

      <label className="block text-xs text-zinc-400">
        Votre email
        <input
          className="mt-1 w-full rounded-md bg-zinc-900/50 border border-white/10 p-2 text-sm text-zinc-200"
          placeholder="name@email.com"
          type="email"
          name="email"
        />
      </label>

      <label className="block text-xs text-zinc-400">
        Message
        <textarea
          className="mt-1 w-full min-h-28 rounded-md bg-zinc-900/50 border border-white/10 p-2 text-sm text-zinc-200"
          placeholder="Dites-m’en plus sur votre projet…"
          name="message"
        />
      </label>

      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-zinc-200 text-zinc-900 text-sm"
      >
        Envoyer
      </button>

      <p className="text-[11px] text-zinc-500">
        *Temporaire : on branchera un mailto ou Formspree/Resend.
      </p>
    </form>
  );
}
