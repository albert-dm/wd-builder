import clsx from "clsx";
import type React from "react";
import { z } from "zod";
import type { WdComponent } from "../../types";

import style from "./stack.module.css";

const StackZodSchema = z.object({
  children: z.custom<React.ReactNode>(),
  fullWidth: z.boolean().optional(),
  gap: z.number().min(0).max(10).optional(),
});

type StackProps = z.infer<typeof StackZodSchema>;

export const Stack: WdComponent = ({
  children,
  fullWidth,
  gap,
}: StackProps) => {
  return (
    <div
      className={clsx({
        [style["stack-wrapper"]]: true,
        [style["stack-full-width"]]: fullWidth,
      })}
      style={{
        gap: `${gap}rem`,
      }}
    >
      {children}
    </div>
  );
};

Stack.defaults = {
  fullWidth: false,
  gap: 1,
};

Stack.zodSchema = StackZodSchema;
