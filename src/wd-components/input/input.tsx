import type React from "react";
import { z } from "zod";
import type { ExtendedComponent } from "../../types/component";
import { Icon, type IconName } from "../icon";
import style from "./input.module.css";

const InputZodSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
  placeholder: z.string().optional(),
  type: z
    .enum(["text", "email", "password", "number", "tel", "url"])
    .optional(),
  iconLeft: z.string().optional(),
  iconRight: z.string().optional(),
  onChange: z.function().args(z.string()).returns(z.void()).optional(),
});

type InputProps = z.infer<typeof InputZodSchema>;

export const Input: ExtendedComponent = ({
  name,
  value,
  placeholder,
  type = "text",
  iconLeft,
  iconRight,
  onChange,
}: InputProps) => {
  const hasIconLeft = Boolean(iconLeft);
  const hasIconRight = Boolean(iconRight);

  const inputClassName = [
    style.input,
    hasIconLeft && style.hasIconLeft,
    hasIconRight && style.hasIconRight,
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={style.inputWrapper}>
      <input
        name={name}
        type={type}
        className={inputClassName}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
      {iconLeft && (
        <Icon icon={iconLeft as IconName} className={style.iconLeft} />
      )}
      {iconRight && (
        <Icon icon={iconRight as IconName} className={style.iconRight} />
      )}
    </div>
  );
};

Input.defaultProps = {
  name: "input",
  type: "text",
  placeholder: "",
};

Input.zodSchema = InputZodSchema;
