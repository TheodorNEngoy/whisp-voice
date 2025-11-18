interface Props {
  params: { id: string };
}

export default function PostPage({ params }: Props) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">SoundThread {params.id}</h1>
      <p className="text-white/60">
        Threaded playback with tap-to-advance captions coming soon.
      </p>
    </section>
  );
}
