import React from "react";
import { button } from "./button.style";
import { z } from "zod";

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

LinkButton.zodSchema = z.object({
  href: z.string().url().optional().or(z.literal('')).or(z.literal('#')),
  label: z.string(),
});