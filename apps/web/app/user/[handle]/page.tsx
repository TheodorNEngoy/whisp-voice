interface Props {
  params: { handle: string };
}

export default function ProfilePage({ params }: Props) {
  return (
    <section>
      <h1 className="text-2xl font-semibold">{params.handle}</h1>
      <p className="text-white/60">Profile timeline coming soon.</p>
    </section>
  );
}
