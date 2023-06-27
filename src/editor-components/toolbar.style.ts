import { CSSProperties } from "react";

export const aside: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  backgroundColor: "#ffffff",
  color: "#000000",
};


export const toolbarWrapper = (minWidth = "220px"):CSSProperties => ({
  minWidth,
  flex: 1,
});
