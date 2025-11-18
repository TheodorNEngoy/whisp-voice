async function getQueue() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/moderation/queue`,
    {
      cache: "no-store",
    },
  );
  return res.json();
}

export default async function ModerationPage() {
  const queue = await getQueue();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Moderation queue</h1>
      <pre className="overflow-auto rounded bg-black/30 p-4 text-xs">
        {JSON.stringify(queue, null, 2)}
      </pre>
    </section>
  );
}
