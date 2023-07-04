import React from "react";

interface StackProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Stack = ({ children, fullWidth }: StackProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </div>
  );
}

Stack.defaultProps = {
  fullWidth: false,
};