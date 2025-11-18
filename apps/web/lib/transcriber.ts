export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface TranscriberResult {
  text: string;
  segments: TranscriptSegment[];
}

export interface Transcriber {
  transcribe(audioPath: string): Promise<TranscriberResult>;
}

export class WhisperCliTranscriber implements Transcriber {
  constructor(private binary = process.env.WHISPER_BIN || "faster-whisper") {}

  async transcribe(audioPath: string): Promise<TranscriberResult> {
    console.info(`Transcribing ${audioPath} via ${this.binary}`);
    return {
      text: "demo transcript",
      segments: [
        { startMs: 0, endMs: 1000, text: "demo" },
        { startMs: 1000, endMs: 2000, text: "segment" },
      ],
    };
  }
}

export function resolveTranscriber(): Transcriber {
  if (process.env.TRANSCRIBER === "external") {
    return {
      async transcribe(audioPath: string) {
        console.info(`Calling external provider for ${audioPath}`);
        return { text: "external transcript", segments: [] };
      },
    };
  }
  return new WhisperCliTranscriber();
}
