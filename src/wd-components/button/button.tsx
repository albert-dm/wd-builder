import React from "react";
import { z } from "zod";
import style from "./button.module.css";

const LinkButtonZodSchema = z.object({
  href: z.string().url().optional().or(z.literal('')).or(z.literal('#')),
  label: z.string(),
});

type LinkButtonProps = z.infer<typeof LinkButtonZodSchema>;

export const LinkButton = ({ href, label }: LinkButtonProps) => {
  return (
      <a href={href} className={style.buttonWrapper}>{label}</a>
  );
}

LinkButton.defaultProps = {
  href: "#",
  label: "Link",
};

LinkButton.zodSchema = LinkButtonZodSchema