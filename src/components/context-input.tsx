import styles from "./context-input.module.css";

interface ContextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ContextInput({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
}: ContextInputProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        <span className={styles.labelText}>{label}</span>
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={10}
          placeholder={placeholder}
        />
      </label>
    </div>
  );
}
