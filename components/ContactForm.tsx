"use client";

type Props = { className?: string; hideTitle?: boolean };

const CONTACT_EMAIL = "anthony@antn.studio";

export function ContactForm({ className = "", hideTitle }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value || "";
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value || "";

    const subject = encodeURIComponent(`Contact antn.studio — ${name}`);
    const body = encodeURIComponent(
      `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <form
      className={`space-y-4 rounded-2xl p-5 ${className}`}
      onSubmit={handleSubmit}
    >
      {!hideTitle && (
        <h2 className="text-lg font-semibold text-zinc-100">Contact</h2>
      )}

      <label className="block text-xs text-zinc-400">
        Votre nom
        <input
          className="mt-1 w-full rounded-md bg-zinc-900/50 border border-white/10 p-2 text-sm text-zinc-200"
          placeholder="John Doe"
          type="text"
          name="name"
          required
        />
      </label>

      <label className="block text-xs text-zinc-400">
        Votre email
        <input
          className="mt-1 w-full rounded-md bg-zinc-900/50 border border-white/10 p-2 text-sm text-zinc-200"
          placeholder="name@email.com"
          type="email"
          name="email"
          required
        />
      </label>

      <label className="block text-xs text-zinc-400">
        Message
        <textarea
          className="mt-1 w-full min-h-28 rounded-md bg-zinc-900/50 border border-white/10 p-2 text-sm text-zinc-200"
          placeholder="Dites-m'en plus sur votre projet…"
          name="message"
          required
        />
      </label>

      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-zinc-200 text-zinc-900 text-sm"
      >
        Envoyer par email
      </button>

      <p className="text-[11px] text-zinc-500">
        Ouvre votre client email vers {CONTACT_EMAIL}
      </p>
    </form>
  );
}
