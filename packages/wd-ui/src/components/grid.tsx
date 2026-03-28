import type React from "react";
import { z } from "zod";
import type { WdComponent } from "../types";

const GridZodSchema = z.object({
  children: z.custom<React.ReactNode>(),
  fullWidth: z.boolean().optional(),
  columns: z.number().min(1).max(12).optional(),
});

type GridProps = z.infer<typeof GridZodSchema>;

export const Grid: WdComponent = ({
  children,
  fullWidth,
  columns,
}: GridProps) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "1rem",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </div>
  );
};

Grid.defaults = {
  columns: 2,
};

Grid.zodSchema = GridZodSchema;
