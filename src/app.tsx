import { useState } from "react";
import { useRewriter } from "./functions/rewriter";
import { useSummarizer } from "./functions/summarizer";
import { readTextFile } from "./functions/file-reader";
import { FileUpload } from "./components/file-upload";
import { ResultDisplay } from "./components/result-display";
import { ContextInput } from "./components/context-input";
import styles from "./app.module.css";

const DEFAULT_REWRITER_CONTEXT = `以下のルールに従って、 面接の文字起こしのテキストを校正して返してください。

ルール:
- 面接の「内容」は改変しない（意図や評価に影響する発言は保持）。
- 明らかなASR誤変換（固有名詞・専門用語・助詞の置き間違い等）は文脈に合わせて訂正する。
- 話者ラベルは 山田: / 鈴木: のように明確にする。
- 出力のタイトルは不要。会話部分のみを返す。

オリジナル
---------
[Taro Yamada] 11:10:03
えーと、Reactのえー、コンポーネント設計をやってて、あ、Recat Nativeも少し。

[Hanako Suzuki] 11:10:10
なるほど、具体的なプロジェクトは？

整形後
---------
山田：Reactのコンポーネント設計を担当していました。React Nativeも一部扱った経験があります。
鈴木：具体的にはどのようなプロジェクトですか？`;

const DEFAULT_SUMMARIZER_CONTEXT = `面接の文字起こしを読み、候補者の評価に関わる情報を中心に、箇条書きで簡潔に要約してください。

- 各回答の要点
- スキルや経験の具体例
- 性格や志向に関する情報
- 志望動機やキャリアプラン
- 特に印象的な発言や懸念点
`;

function App() {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rewrittenText, setRewrittenText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [rewriterContext, setRewriterContext] = useState(
    DEFAULT_REWRITER_CONTEXT
  );
  const [summarizerContext, setSummarizerContext] = useState(
    DEFAULT_SUMMARIZER_CONTEXT
  );

  const rewriter = useRewriter();
  const summarizer = useSummarizer();

  const handleFileSelect = async (file: File) => {
    try {
      const text = await readTextFile(file);
      setIsProcessing(true);
      await Promise.all([
        rewriter.rewriteStreaming(text, rewriterContext, (chunk) =>
          setRewrittenText((text) => text + chunk)
        ),
        summarizer.summarizeStreaming(text, summarizerContext, (chunk) =>
          setSummaryText((text) => text + chunk)
        ),
      ]);
    } catch (_) {
      setFileError("ファイル処理中にエラーが発生しました");
    } finally {
      setIsProcessing(false);
    }
  };

  const isUnavailable = !rewriter.isAvailable && !summarizer.isAvailable;
  const isReady = rewriter.isAvailable && summarizer.isAvailable;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>zoomary</h1>
      </div>

      {isUnavailable && (
        <div className={styles.error}>
          このデバイスでは利用できません。PC 版 Chrome
          の最新版でお試しください。
        </div>
      )}

      {isReady && (
        <>
          <div className={styles.form}>
            <div className={styles.contextSettings}>
              <ContextInput
                label="整形用コンテキスト"
                value={rewriterContext}
                onChange={setRewriterContext}
                disabled={isProcessing}
                placeholder="整形処理の指示を入力"
              />
              <ContextInput
                label="要約用コンテキスト"
                value={summarizerContext}
                onChange={setSummarizerContext}
                disabled={isProcessing}
                placeholder="要約処理の指示を入力"
              />
            </div>
            <FileUpload
              onFileSelect={handleFileSelect}
              error={fileError}
              disabled={isProcessing}
            />
          </div>

          <ResultDisplay
            rewritten={rewrittenText}
            summary={summaryText}
            isProcessing={isProcessing}
          />
        </>
      )}
    </div>
  );
}

export default App;
