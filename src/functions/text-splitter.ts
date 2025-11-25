import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * テキストを分割するかどうかを判定し、必要に応じて分割する
 */
export async function splitTextIfNeeded(
  text: string,
  measureInputUsage: (text: string) => Promise<number>,
  inputQuota: number
): Promise<string[]> {
  const usage = await measureInputUsage(text);
  if (usage <= inputQuota) {
    return [text];
  }

  const numChunks = Math.floor(usage / inputQuota) + 1;
  const chunkSize = Math.ceil(usage / numChunks);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: Math.floor(chunkSize * 0.1), // 10%のオーバーラップ
    separators: ["\n\n", "\n", "。", "、", " ", ""],
  });
  const chunks = await splitter.splitText(text);
  return chunks;
}
