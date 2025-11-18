"use client";

import { useState } from "react";
import { Recorder } from "@/components/recorder";
import { uploadRecording } from "@/lib/uploads";

export default function ComposePage() {
  const [status, setStatus] = useState<string>("Idle");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Compose</h1>
      <Recorder
        onReady={async (file, waveform, durationSec) => {
          setStatus("Uploading…");
          try {
            await uploadRecording({ file, waveform, durationSec });
            setStatus("Uploaded demo payload to mock endpoint");
          } catch (error) {
            console.error(error);
            setStatus("Upload failed");
          }
        }}
      />
      <p className="text-sm text-white/60">Status: {status}</p>
    </div>
  );
}
