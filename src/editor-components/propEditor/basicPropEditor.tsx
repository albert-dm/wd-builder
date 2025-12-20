import React, { useEffect } from "react";
import { Stack } from "../../wd-components";
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
    <Stack fullWidth>
      <textarea onChange={handleChange} value={stringVal}></textarea>
      <strong>{error}</strong>
    </Stack>
  );
};
