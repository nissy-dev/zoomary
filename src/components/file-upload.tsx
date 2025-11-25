import styles from "./file-upload.module.css";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  error: string | null;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, error, disabled }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <span className={styles.labelText}>文字起こしファイル</span>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          disabled={disabled}
          className={styles.input}
          multiple={false}
        />
      </label>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
