import React, { useEffect } from "react";
import { Stack } from "../../wd-components";
import { PropEditorInterface } from "./propEditor";

export const BasicPropEditor = ({ value, onChange, error, setError }: PropEditorInterface<any>) => {
  const [stringVal, setStringVal] = React.useState(JSON.stringify(value));
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStringVal(e.target.value);
  };

  useEffect(() => {
    setStringVal(JSON.stringify(value));
  }, [value]);

  useEffect(() => {
    try {
      const newValue = JSON.parse(stringVal)
      onChange(newValue);
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