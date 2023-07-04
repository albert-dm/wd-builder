import React from "react";
import { button } from "./button.style";

interface LinkButtonProps {
  href: string;
  label: string;
}

export const LinkButton = ({ href, label }: LinkButtonProps) => {
  return (
      <a href={href} style={button("primary")}>{label}</a>
  );
}

LinkButton.defaultProps = {
  href: "#",
  label: "Link",
};