import type React from "react";
import { z } from "zod";
import type { ExtendedComponent } from "../../types/component";
import style from "./button.module.css";

export type ButtonVariant = "primary" | "secondary";

const ButtonZodSchema = z.object({
  children: z.custom<React.ReactNode>(),
  variant: z.enum(["primary", "secondary"]).optional(),
  onClick: z.function().args().returns(z.void()).optional(),
});

type ButtonProps = z.infer<typeof ButtonZodSchema>;

export const Button: ExtendedComponent = ({
  children,
  variant = "primary",
  onClick,
}: ButtonProps) => {
  const className =
    variant === "secondary" ? `${style.btn} ${style.secondary}` : style.btn;
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
};

Button.defaultProps = {
  variant: "primary",
};

Button.zodSchema = ButtonZodSchema;

const LinkButtonZodSchema = z.object({
  href: z.string().url().optional().or(z.literal("")).or(z.literal("#")),
  label: z.string().optional(),
  children: z.custom<React.ReactNode>().optional(),
  variant: z.enum(["primary", "secondary"]).optional(),
});

type LinkButtonProps = z.infer<typeof LinkButtonZodSchema>;

export const LinkButton: ExtendedComponent = ({
  href,
  label,
  children,
  variant = "primary",
}: LinkButtonProps) => {
  const className =
    variant === "secondary" ? `${style.btn} ${style.secondary}` : style.btn;
  return (
    <a href={href} className={className}>
      {children ?? label}
    </a>
  );
};

LinkButton.defaultProps = {
  href: "#",
  label: "Link",
  variant: "primary",
};

LinkButton.zodSchema = LinkButtonZodSchema;
