import Link from "next/link";
import Feed from "@/components/feed";

export default function Home() {
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Whisp</h1>
        <p className="text-white/70">
          Voice-only social network for short-lived vibes.
        </p>
        <div className="flex gap-3">
          <Link
            className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-black"
            href="/compose"
          >
            Compose a Whisp
          </Link>
          <Link
            className="rounded-full border border-white/20 px-4 py-2"
            href="/messages"
          >
            Messages
          </Link>
        </div>
      </header>
      <Feed />
    </main>
  );
}
