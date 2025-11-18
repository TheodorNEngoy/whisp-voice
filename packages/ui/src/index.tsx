"use client";

import * as React from "react";

export interface WaveformProps {
  samples: number[];
  durationSec: number;
}

export const WaveformPreview: React.FC<WaveformProps> = ({
  samples,
  durationSec,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-neutral-500">
        {durationSec.toFixed(1)}s preview
      </div>
      <div className="flex h-16 items-end gap-0.5 rounded bg-neutral-900/40 p-2">
        {samples.map((value, idx) => (
          <span
            key={idx}
            style={{ height: `${Math.max(5, Math.abs(value) * 100)}%` }}
            className="w-1 rounded-full bg-emerald-400"
          />
        ))}
      </div>
    </div>
  );
};

export const Card: React.FC<
  React.PropsWithChildren<{ title: string; actions?: React.ReactNode }>
> = ({ title, actions, children }) => (
  <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <header className="mb-2 flex items-center justify-between">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {actions}
    </header>
    <div className="text-sm text-white/90">{children}</div>
  </section>
);
