import React, { useEffect } from "react";
import { Stack } from "../wd-components";

type BasicPropEditorProps = {
  value: any;
  onChange: (value: any) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const BasicPropEditor = ({ value, onChange, error, setError }: any) => {
  const [stringVal, setStringVal] = React.useState(JSON.stringify(value));
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStringVal(e.target.value);
  };

  useEffect(() => {
    setStringVal(JSON.stringify(value));
  }, [value]);

  useEffect(() => {
    try {
      onChange(JSON.parse(stringVal));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [stringVal, onChange, setError]);

  return <Stack fullWidth>
          <textarea onChange={handleChange} value={stringVal}>
          </textarea>
      <strong>{error}</strong>
  </Stack>;
}