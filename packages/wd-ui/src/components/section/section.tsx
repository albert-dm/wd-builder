import type React from "react";
import { z } from "zod";
import type { WdComponent } from "../../types";

import style from "./section.module.css";

const SectionZodSchema = z.object({
  containerType: z.enum(["default", "full", "breakout"]),
  children: z.custom<React.ReactNode>(),
  className: z.string().optional(),
});

type SectionProps = z.infer<typeof SectionZodSchema>;

export const Section: WdComponent = ({
  containerType,
  children,
  className,
}: SectionProps) => {
  const containerClassName = style[containerType] ?? "";

  return (
    <section className={`${className} ${containerClassName}`}>
      {children}
    </section>
  );
};

Section.defaults = {
  containerType: "default",
};

Section.zodSchema = SectionZodSchema;
