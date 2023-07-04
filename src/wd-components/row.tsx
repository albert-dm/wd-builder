import React from "react";

interface RowProps {
  children: React.ReactNode;
  pageHeight?: boolean;
}

export const Row = ({ children, pageHeight }: RowProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        height: pageHeight ? "100dvh" : "auto",
      }}
    >
      {children}
    </div>
  );
}

Row.defaultProps = {
  pageHeight: false,
};