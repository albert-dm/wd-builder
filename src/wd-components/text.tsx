interface TextProps {
  value: string;
  type: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export const Text = ({ value, type }: TextProps) => {
  const Component = type;
  return <Component>{value}</Component>;
};

Text.defaultProps = {
  value: "Text",
  type: "p",
};
