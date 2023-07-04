import React from "react";

interface TextProps {
  value: string;
  type: 'h1' | 'h2' | 'h3' | 'p';
}

export const Text = ({ value, type }: TextProps) => {
  const Component = type;
  return (
    <Component>{value}</Component>
  );
}

Text.defaultProps = {
  value: "Text",
  type: "p",
};