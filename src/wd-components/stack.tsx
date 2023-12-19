import React from "react";

interface StackProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  gap?: number;
}

export const Stack = ({ children, fullWidth, gap }: StackProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: gap + "rem",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </div>
  );
}

Stack.defaultProps = {
  fullWidth: false,
  gap: 1,
};