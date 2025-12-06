import { useState, useEffect, useCallback } from "react";
import { splitTextIfNeeded } from "./text-splitter";

export function useRewriter() {
  const isRewriterDefined = "Rewriter" in window;
  const initialAvailability = isRewriterDefined ? null : "unavailable";
  const [availability, setAvailability] = useState<Availability | null>(
    initialAvailability
  );
  useEffect(() => {
    if (!isRewriterDefined) return;
    Rewriter.availability().then((availability) => {
      setAvailability(availability);
    });
  }, [isRewriterDefined]);

  const rewriteStreaming = useCallback(
    async (text: string, context: string, onChunk: (chunk: string) => void) => {
      const options = {
        tone: "more-formal",
        format: "markdown",
        length: "as-is",
        expectedContextLanguages: ["ja"],
        expectedInputLanguages: ["ja"],
        outputLanguage: "ja",
      } as const;
      let rewriter = await Rewriter.create(options);

      try {
        const chunks = await splitTextIfNeeded(
          text,
          (input) => rewriter.measureInputUsage(input),
          rewriter.inputQuota
        );
        rewriter.destroy();

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          rewriter = await Rewriter.create(options);
          const stream = rewriter.rewriteStreaming(chunk, { context });
          for await (const streamChunk of stream) {
            onChunk(streamChunk);
          }

          rewriter.destroy();
        }
      } catch (error) {
        rewriter.destroy();
        throw error;
      }
    },
    []
  );

  return {
    isAvailable: availability !== "unavailable",
    rewriteStreaming,
  };
}
