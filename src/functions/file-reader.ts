export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        resolve(text);
      } else {
        reject(new Error("ファイルの読み込みに失敗しました"));
      }
    };

    reader.onerror = () => {
      reject(new Error("ファイルの読み込み中にエラーが発生しました"));
    };

    reader.readAsText(file);
  });
}
