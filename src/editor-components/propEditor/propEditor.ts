export interface PropEditorInterface<T> {
  value: T;
  onChange: (value: T) => void;
  error: string | null;
  setError: (error: string | null) => void;
}
