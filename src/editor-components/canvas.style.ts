import { CSSProperties } from "react";

export const canvasWrapper: CSSProperties = {
  position: "relative",
  width: "100dvw",
  height: "100dvh",
  overflow: "hidden",
  backgroundColor: "#AAAAAA",
  display: "grid",
  gridTemplateColumns: "1fr 4fr",
  gridTemplateRows: "auto",
  gap: "1rem",
};

export const webPreviewWrapper: CSSProperties = {
  width: "100%",
  height: "100%",
};

export const previewArea: CSSProperties = {
  width: "100%",
  height: "100%",
};