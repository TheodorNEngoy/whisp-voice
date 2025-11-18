"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WaveformPreview } from "@whisp/ui";

const MAX_DURATION_MS = 60_000;
const SAMPLE_RATE = 48_000;

interface RecorderProps {
  onReady(file: File, waveform: number[], durationSec: number): void;
}

const silenceThreshold = 0.005;

export function Recorder({ onReady }: RecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const analyser = useRef<AnalyserNode>();
  const dataArray = useRef<Float32Array>();
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const updateWaveform = useCallback(() => {
    if (!analyser.current || !dataArray.current) return;
    analyser.current.getFloatTimeDomainData(dataArray.current);
    const peak = Math.max(...dataArray.current.map((v) => Math.abs(v)));
    setWaveform((prev) => [...prev.slice(-63), peak]);
    requestAnimationFrame(updateWaveform);
  }, []);

  useEffect(() => {
    return () => {
      mediaRecorder.current?.stop();
      mediaRecorder.current = null;
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    const mimeTypes = ["audio/webm;codecs=opus", "audio/mp4;codecs=aac"];
    const supported = mimeTypes.find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    if (!supported) {
      setError("Browser recording unsupported");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: SAMPLE_RATE },
    });
    const media = new MediaRecorder(stream, { mimeType: supported });
    mediaRecorder.current = media;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser.current = audioCtx.createAnalyser();
    analyser.current.fftSize = 2048;
    dataArray.current = new Float32Array(analyser.current.fftSize);
    source.connect(analyser.current);
    updateWaveform();

    media.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setChunks((prev) => [...prev, event.data]);
      }
    };

    media.start();
    setRecording(true);
    setChunks([]);
    setDuration(0);

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setDuration(elapsed);
      if (elapsed >= MAX_DURATION_MS) {
        stopRecording();
      }
    }, 100);

    media.onstop = () => {
      clearInterval(interval);
      setRecording(false);
    };
  }, [updateWaveform]);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
  }, []);

  useEffect(() => {
    if (!recording && chunks.length) {
      const blob = new Blob(chunks, { type: mediaRecorder.current?.mimeType });
      const file = new File([blob], `whisp-${Date.now()}.webm`, {
        type: blob.type,
      });
      const durationSec = duration / 1000;
      const trimmed = trimSilence(waveform, silenceThreshold);
      const effectiveDuration = Math.max(
        0,
        durationSec - trimmed.trimmedSeconds,
      );
      onReady(file, trimmed.samples, effectiveDuration);
    }
  }, [recording, chunks, duration, waveform, onReady]);

  return (
    <div className="space-y-3">
      <button
        className={`rounded-full px-6 py-3 font-semibold text-black ${recording ? "bg-red-400" : "bg-emerald-400"}`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop" : "Record"}
      </button>
      <WaveformPreview samples={waveform} durationSec={duration / 1000} />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

function trimSilence(samples: number[], threshold: number) {
  if (!samples.length) return { samples, trimmedSeconds: 0 };
  let start = 0;
  let end = samples.length - 1;
  while (start < samples.length && Math.abs(samples[start]) < threshold)
    start += 1;
  while (end > start && Math.abs(samples[end]) < threshold) end -= 1;
  const trimmed = samples.slice(start, end + 1);
  const trimmedSeconds =
    ((start + (samples.length - end)) / samples.length) *
    (MAX_DURATION_MS / 1000);
  return { samples: trimmed, trimmedSeconds };
}
