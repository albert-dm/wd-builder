import React, { useEffect } from "react";
import type { PropEditorInterface } from "./propEditor";

export const BasicPropEditor = ({
  value,
  onChange,
  error,
  setError,
}: PropEditorInterface<unknown>) => {
  const [stringVal, setStringVal] = React.useState(JSON.stringify(value));
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStringVal(e.target.value);
  };

  useEffect(() => {
    setStringVal(JSON.stringify(value));
  }, [value]);

  useEffect(() => {
    try {
      const newValue = JSON.parse(stringVal);
      onChange(newValue);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [stringVal, onChange, setError]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "0.5rem",
      }}
    >
      <textarea onChange={handleChange} value={stringVal} />
      {error && <strong style={{ color: "red" }}>{error}</strong>}
    </div>
  );
};
