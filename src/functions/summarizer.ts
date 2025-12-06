import { useState, useEffect, useCallback } from "react";
import { splitTextIfNeeded } from "./text-splitter";

export function useSummarizer() {
  const isSummarizerDefined = "Summarizer" in window;
  const initialAvailability = isSummarizerDefined ? null : "unavailable";
  const [availability, setAvailability] = useState<Availability | null>(
    initialAvailability
  );

  useEffect(() => {
    if (!isSummarizerDefined) return;
    Summarizer.availability().then((availability) => {
      setAvailability(availability);
    });
  }, [isSummarizerDefined]);

  const summarizeStreaming = useCallback(
    async (text: string, context: string, onChunk: (chunk: string) => void) => {
      const options = {
        type: "key-points",
        format: "markdown",
        length: "long",
        expectedContextLanguages: ["ja"],
        expectedInputLanguages: ["ja"],
        outputLanguage: "ja",
      } as const;
      let summarizer = await Summarizer.create(options);

      try {
        const chunks = await splitTextIfNeeded(
          text,
          (input) => summarizer.measureInputUsage(input),
          summarizer.inputQuota
        );
        summarizer.destroy();

        let summaries = "";
        for (let i = 0; i < chunks.length; i++) {
          summarizer = await Summarizer.create(options);
          const stream = summarizer.summarizeStreaming(chunks[i], { context });
          for await (const streamChunk of stream) {
            onChunk(streamChunk);
            summaries += streamChunk;
          }
          summarizer.destroy();
        }

        onChunk("\n\n");

        summarizer = await Summarizer.create({
          ...options,
          type: "tldr",
          length: "long",
        });
        const finalStream = summarizer.summarizeStreaming(summaries);
        for await (const streamChunk of finalStream) {
          onChunk(streamChunk);
        }

        summarizer.destroy();
      } catch (error) {
        summarizer.destroy();
        throw error;
      }
    },
    []
  );

  return {
    isAvailable: availability !== "unavailable",
    summarizeStreaming,
  };
}
