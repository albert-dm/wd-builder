import React from "react";

interface GridProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  columns?: number;
}

export const Grid = ({ children, fullWidth, columns }: GridProps) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "1rem",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </div>
  );
}

Grid.defaultProps = {
  columns: 2,
};