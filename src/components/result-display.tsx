import { useState } from "react";
import Markdown from "react-markdown";

import styles from "./result-display.module.css";

type TabType = "rewritten" | "summary";

interface ResultDisplayProps {
  rewritten: string;
  summary: string;
  isProcessing: boolean;
}

export function ResultDisplay({
  rewritten,
  summary,
  isProcessing,
}: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>("rewritten");

  const handleCopy = async () => {
    const text = activeTab === "rewritten" ? rewritten : summary;
    try {
      await navigator.clipboard.writeText(text);
      alert("コピーしました");
    } catch (error) {
      alert("コピーに失敗しました");
    }
  };

  const hasContent = rewritten || summary;

  if (!hasContent && !isProcessing) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "rewritten" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("rewritten")}
        >
          整形結果
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "summary" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("summary")}
        >
          議事録
        </button>
      </div>

      <div className={styles.content}>
        {isProcessing && !hasContent && (
          <div className={styles.loading}>処理中...</div>
        )}

        {activeTab === "rewritten" && rewritten && (
          <div className={styles.result}>
            <Markdown>{rewritten}</Markdown>
          </div>
        )}

        {activeTab === "summary" && summary && (
          <div className={styles.result}>
            <Markdown>{summary}</Markdown>
          </div>
        )}

        {!isProcessing && hasContent && (
          <div className={styles.actions}>
            <button onClick={handleCopy} className={styles.button}>
              コピー
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
